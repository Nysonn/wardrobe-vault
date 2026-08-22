import type { Prisma } from "@/lib/generated/prisma/client";
import {
  NotificationType,
  PayoutStatus,
  WalletTransactionType,
} from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/services/notifications";

import { PayoutServiceError } from "./errors";
import { assertPayoutTransition } from "./stateMachine";

export type AdminPayoutAction =
  | "approve"
  | "process"
  | "mark-paid"
  | "hold"
  | "release"
  | "fail";

type TransitionPayoutInput = {
  payoutId: string;
  adminId: string;
  action: AdminPayoutAction;
  notes?: string;
  failureReason?: string;
};

function actionToStatus(action: AdminPayoutAction): PayoutStatus | null {
  switch (action) {
    case "approve":
      return PayoutStatus.APPROVED;
    case "process":
      return PayoutStatus.PROCESSING;
    case "mark-paid":
      return PayoutStatus.PAID;
    case "hold":
      return PayoutStatus.ON_HOLD;
    case "release":
      return PayoutStatus.PENDING;
    case "fail":
      return PayoutStatus.FAILED;
    default:
      return null;
  }
}

const ACTION_LABELS: Record<AdminPayoutAction, string> = {
  approve: "PAYOUT_APPROVED",
  process: "PAYOUT_PROCESSING",
  "mark-paid": "PAYOUT_PAID",
  hold: "PAYOUT_ON_HOLD",
  release: "PAYOUT_RELEASED",
  fail: "PAYOUT_FAILED",
};

async function completePayout(
  tx: Prisma.TransactionClient,
  payout: {
    id: string;
    sellerId: string;
    netAmount: number;
    orderId: string;
    order: { orderNumber: string };
  },
  adminId: string,
  now: Date,
) {
  const wallet = await tx.wallet.upsert({
    where: { userId: payout.sellerId },
    create: { userId: payout.sellerId },
    update: {},
    select: { id: true, pendingBalance: true },
  });

  if (wallet.pendingBalance < payout.netAmount) {
    throw new PayoutServiceError(
      "Seller pending balance is insufficient for this payout.",
    );
  }

  await tx.wallet.update({
    where: { id: wallet.id },
    data: {
      pendingBalance: { decrement: payout.netAmount },
      availableBalance: { increment: payout.netAmount },
    },
  });

  await tx.walletTransaction.create({
    data: {
      walletId: wallet.id,
      payoutId: payout.id,
      type: WalletTransactionType.PAYOUT_DEBIT,
      amount: payout.netAmount,
      currency: "UGX",
      description: `Payout — ${payout.order.orderNumber}`,
    },
  });

  await tx.payout.update({
    where: { id: payout.id },
    data: {
      status: PayoutStatus.PAID,
      approvedById: adminId,
      approvedAt: now,
      paidAt: now,
    },
  });

  await tx.order.update({
    where: { id: payout.orderId },
    data: { payoutStatus: PayoutStatus.PAID },
  });

  await createNotification(
    {
      userId: payout.sellerId,
      type: NotificationType.PAYOUT_COMPLETED,
      title: "Payout completed",
      body: `Your earnings for order ${payout.order.orderNumber} have been paid out.`,
      link: "/wallet",
    },
    tx,
  );
}

/**
 * Admin-only payout status transitions (AGENTS.md §2, §49).
 */
export async function transitionPayoutStatus({
  payoutId,
  adminId,
  action,
  notes,
  failureReason,
}: TransitionPayoutInput) {
  const toStatus = actionToStatus(action);
  if (!toStatus) {
    throw new PayoutServiceError("Unknown payout action.");
  }

  const payout = await prisma.payout.findUnique({
    where: { id: payoutId },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          payoutStatus: true,
        },
      },
      seller: { select: { id: true, email: true } },
    },
  });

  if (!payout) {
    throw new PayoutServiceError("Payout not found.");
  }

  if (payout.status === toStatus) {
    return { payoutId, status: payout.status };
  }

  try {
    assertPayoutTransition(payout.status, toStatus);
  } catch {
    throw new PayoutServiceError(
      `Cannot ${action.replace("-", " ")} a payout with status "${payout.status}".`,
    );
  }

  const now = new Date();

  await prisma.$transaction(async (tx) => {
    if (action === "mark-paid") {
      await completePayout(tx, payout, adminId, now);
      return;
    }

    const updateData: Prisma.PayoutUpdateInput = {
      status: toStatus,
      notes: notes ?? payout.notes,
    };

    if (action === "approve") {
      updateData.approvedById = adminId;
      updateData.approvedAt = now;
    }

    if (action === "fail") {
      updateData.failureReason =
        failureReason ?? "Payout could not be completed.";
    }

    await tx.payout.update({
      where: { id: payoutId },
      data: updateData,
    });

    await tx.order.update({
      where: { id: payout.orderId },
      data: { payoutStatus: toStatus },
    });

    if (action === "approve") {
      await createNotification(
        {
          userId: payout.sellerId,
          type: NotificationType.PAYOUT_APPROVED,
          title: "Payout approved",
          body: `Your earnings for order ${payout.order.orderNumber} have been approved and will be processed shortly.`,
          link: "/wallet",
        },
        tx,
      );
    }
  });

  await prisma.adminAction.create({
    data: {
      adminId,
      action: ACTION_LABELS[action],
      targetType: "Payout",
      targetId: payoutId,
      details: {
        orderNumber: payout.order.orderNumber,
        sellerEmail: payout.seller.email,
        fromStatus: payout.status,
        toStatus,
        notes: notes ?? null,
        failureReason: failureReason ?? null,
      },
    },
  });

  return { payoutId, status: toStatus };
}
