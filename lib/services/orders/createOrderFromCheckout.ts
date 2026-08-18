import { getPaymentProvider } from "@/lib/payments";
import {
  ListingStatus,
  OrderStatus,
  PaymentStatus,
  PayoutStatus,
} from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { assertListingTransition } from "@/lib/services/listings/stateMachine";
import { assertOrderTransition, assertPaymentTransition } from "@/lib/services/orders/stateMachine";

import { calculateOrderTotals } from "./calculateOrderTotals";
import { OrderServiceError } from "./errors";
import { generateOrderNumber } from "./generateOrderNumber";
import { assertListingPurchasable } from "./getCheckoutPreview";
import { resolveCommissionRate } from "./resolveCommissionRate";
import { recordSaleWalletEntries } from "@/lib/services/payouts/recordSaleWalletEntries";

export type CreateOrderResult = {
  orderId: string;
  orderNumber: string;
  paymentStatus: PaymentStatus;
};

import type { Prisma } from "@/lib/generated/prisma/client";

async function ensureSellerWallet(
  tx: Prisma.TransactionClient,
  sellerId: string,
) {
  return tx.wallet.upsert({
    where: { userId: sellerId },
    create: { userId: sellerId },
    update: {},
    select: { id: true },
  });
}

/**
 * Creates an order from checkout, processes payment through the configured
 * provider, and records platform-held seller earnings on success.
 *
 * All monetary values are re-fetched and recalculated server-side — the client
 * may only supply the listing ID (AGENTS.md §2).
 */
export async function createOrderFromCheckout(
  buyerId: string,
  listingId: string,
): Promise<CreateOrderResult> {
  const { listing } = await assertListingPurchasable(listingId, buyerId);

  const commissionRateBps = await resolveCommissionRate({
    sellerId: listing.sellerId,
    categoryId: listing.categoryId,
  });

  const shippingFee = listing.shippingDetail?.fee ?? 0;

  const totals = calculateOrderTotals({
    itemPrice: listing.price,
    shippingFee,
    commissionRateBps,
  });

  const paymentProvider = getPaymentProvider();
  const now = new Date();

  const { order, payment } = await prisma.$transaction(async (tx) => {
    const current = await tx.listing.findUnique({
      where: { id: listingId },
      select: { status: true },
    });

    if (!current || current.status !== ListingStatus.PUBLISHED) {
      throw new OrderServiceError("This piece is no longer available.");
    }

    const orderNumber = await generateOrderNumber(tx);

    const createdOrder = await tx.order.create({
      data: {
        orderNumber,
        buyerId,
        sellerId: listing.sellerId,
        status: OrderStatus.ORDER_PLACED,
        paymentStatus: PaymentStatus.PENDING,
        payoutStatus: PayoutStatus.PENDING,
        itemPrice: totals.itemPrice,
        commissionAmount: totals.commissionAmount,
        commissionRateBps: totals.commissionRateBps,
        shippingFee: totals.shippingFee,
        totalAmount: totals.buyerTotal,
        currency: listing.currency,
        items: {
          create: {
            listingId: listing.id,
            titleSnapshot: listing.title,
            price: totals.itemPrice,
          },
        },
      },
      select: { id: true, orderNumber: true },
    });

    const initiated = await paymentProvider.initiatePayment({
      orderId: createdOrder.id,
      userId: buyerId,
      amount: totals.buyerTotal,
      currency: listing.currency,
    });

    const createdPayment = await tx.payment.create({
      data: {
        orderId: createdOrder.id,
        userId: buyerId,
        provider: paymentProvider.name,
        providerReference: initiated.providerReference,
        status: PaymentStatus.PENDING,
        amount: totals.buyerTotal,
        currency: listing.currency,
      },
      select: { id: true, status: true },
    });

    return { order: createdOrder, payment: createdPayment };
  });

  const paymentResult = await paymentProvider.processPayment({
    paymentId: payment.id,
  });

  if (paymentResult.status === PaymentStatus.CONFIRMED) {
    return finalizeSuccessfulPayment({
      orderId: order.id,
      orderNumber: order.orderNumber,
      listingId: listing.id,
      sellerId: listing.sellerId,
      buyerId,
      totals,
      paidAt: now,
    });
  }

  await prisma.$transaction(async (tx) => {
    const currentOrder = await tx.order.findUnique({
      where: { id: order.id },
      select: { status: true, paymentStatus: true },
    });

    if (!currentOrder) {
      return;
    }

    assertOrderTransition(currentOrder.status, OrderStatus.CANCELLED);
    assertPaymentTransition(currentOrder.paymentStatus, PaymentStatus.FAILED);

    await tx.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.CANCELLED,
        paymentStatus: PaymentStatus.FAILED,
        cancelledAt: now,
      },
    });
  });

  throw new OrderServiceError(
    paymentResult.failureReason ??
      "Payment could not be completed. No charge was made.",
  );
}

type FinalizePaymentInput = {
  orderId: string;
  orderNumber: string;
  listingId: string;
  sellerId: string;
  buyerId: string;
  totals: ReturnType<typeof calculateOrderTotals>;
  paidAt: Date;
};

async function finalizeSuccessfulPayment(
  input: FinalizePaymentInput,
): Promise<CreateOrderResult> {
  await prisma.$transaction(async (tx) => {
    const currentOrder = await tx.order.findUnique({
      where: { id: input.orderId },
      select: { status: true, paymentStatus: true },
    });

    if (!currentOrder) {
      throw new OrderServiceError("Order not found.");
    }

    assertOrderTransition(currentOrder.status, OrderStatus.PAYMENT_CONFIRMED);
    assertOrderTransition(OrderStatus.PAYMENT_CONFIRMED, OrderStatus.AWAITING_SELLER);
    assertPaymentTransition(currentOrder.paymentStatus, PaymentStatus.CONFIRMED);

    await tx.order.update({
      where: { id: input.orderId },
      data: {
        status: OrderStatus.AWAITING_SELLER,
        paymentStatus: PaymentStatus.CONFIRMED,
        paidAt: input.paidAt,
      },
    });

    const listing = await tx.listing.findUnique({
      where: { id: input.listingId },
      select: { status: true },
    });

    if (!listing) {
      throw new OrderServiceError("Listing not found.");
    }

    assertListingTransition(listing.status, ListingStatus.SOLD);

    await tx.listing.update({
      where: { id: input.listingId },
      data: {
        status: ListingStatus.SOLD,
        soldAt: input.paidAt,
      },
    });

    await tx.listingStatusHistory.create({
      data: {
        listingId: input.listingId,
        fromStatus: listing.status,
        toStatus: ListingStatus.SOLD,
        actorId: input.buyerId,
        reason: "Purchase completed",
        notes: `Order ${input.orderNumber}`,
      },
    });

    const payout = await tx.payout.create({
      data: {
        orderId: input.orderId,
        sellerId: input.sellerId,
        grossAmount: input.totals.itemPrice,
        commissionAmount: input.totals.commissionAmount,
        netAmount: input.totals.sellerNetEarnings,
        currency: "UGX",
        status: PayoutStatus.PENDING,
      },
      select: { id: true },
    });

    const wallet = await ensureSellerWallet(tx, input.sellerId);

    await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        pendingBalance: { increment: input.totals.sellerNetEarnings },
      },
    });

    const itemTitle =
      (
        await tx.orderItem.findFirst({
          where: { orderId: input.orderId },
          select: { titleSnapshot: true },
        })
      )?.titleSnapshot ?? "Sale";

    await recordSaleWalletEntries({
      tx,
      walletId: wallet.id,
      payoutId: payout.id,
      listingTitle: itemTitle,
      orderNumber: input.orderNumber,
      grossAmount: input.totals.itemPrice,
      commissionAmount: input.totals.commissionAmount,
    });
  });

  return {
    orderId: input.orderId,
    orderNumber: input.orderNumber,
    paymentStatus: PaymentStatus.CONFIRMED,
  };
}
