import { ListingStatus, OrderStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

import { calculateOrderTotals } from "./calculateOrderTotals";
import { OrderServiceError } from "./errors";
import { resolveCommissionRate } from "./resolveCommissionRate";

export type CheckoutPreview = {
  listing: {
    id: string;
    title: string;
    price: number;
    currency: string;
    status: ListingStatus;
    imageUrl: string | null;
    categoryName: string;
  };
  seller: {
    id: string;
    name: string | null;
    isVerifiedPublicFigure: boolean;
  };
  shipping: {
    isAvailable: boolean;
    regions: string[];
    fee: number;
    estimatedDaysMin: number | null;
    estimatedDaysMax: number | null;
  };
  totals: ReturnType<typeof calculateOrderTotals>;
  commissionSettingLabel: string;
};

async function assertListingPurchasable(
  listingId: string,
  buyerId: string,
): Promise<{
  listing: {
    id: string;
    title: string;
    price: number;
    currency: string;
    status: ListingStatus;
    sellerId: string;
    categoryId: string;
    category: { name: string };
    images: { url: string }[];
    shippingDetail: {
      isAvailable: boolean;
      regions: string[];
      fee: number;
      estimatedDaysMin: number | null;
      estimatedDaysMax: number | null;
    } | null;
    seller: {
      id: string;
      name: string | null;
      isVerifiedPublicFigure: boolean;
    };
  };
}> {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      title: true,
      price: true,
      currency: true,
      status: true,
      sellerId: true,
      categoryId: true,
      category: { select: { name: true } },
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: { url: true },
      },
      shippingDetail: {
        select: {
          isAvailable: true,
          regions: true,
          fee: true,
          estimatedDaysMin: true,
          estimatedDaysMax: true,
        },
      },
      seller: {
        select: {
          id: true,
          name: true,
          isVerifiedPublicFigure: true,
        },
      },
    },
  });

  if (!listing) {
    throw new OrderServiceError("This piece is no longer available.");
  }

  if (listing.status !== ListingStatus.PUBLISHED) {
    throw new OrderServiceError(
      listing.status === ListingStatus.SOLD
        ? "This piece has already found its next chapter."
        : "This piece is not available for purchase.",
    );
  }

  if (listing.sellerId === buyerId) {
    throw new OrderServiceError("You cannot purchase your own listing.");
  }

  if (!listing.shippingDetail?.isAvailable) {
    throw new OrderServiceError(
      "Shipping is not available for this piece. Contact the seller through messages when messaging is live.",
    );
  }

  if (listing.price <= 0) {
    throw new OrderServiceError("This listing does not have a valid price.");
  }

  const openOrder = await prisma.orderItem.findFirst({
    where: {
      listingId,
      order: {
        status: {
          notIn: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
        },
      },
    },
    select: { id: true },
  });

  if (openOrder) {
    throw new OrderServiceError(
      "This piece already has an active order in progress.",
    );
  }

  return { listing };
}

function commissionLabel(rateBps: number) {
  const percent = rateBps / 100;
  return percent % 1 === 0 ? `${percent}%` : `${percent.toFixed(2)}%`;
}

export async function getCheckoutPreview(
  listingId: string,
  buyerId: string,
): Promise<CheckoutPreview> {
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

  return {
    listing: {
      id: listing.id,
      title: listing.title,
      price: listing.price,
      currency: listing.currency,
      status: listing.status,
      imageUrl: listing.images[0]?.url ?? null,
      categoryName: listing.category.name,
    },
    seller: listing.seller,
    shipping: {
      isAvailable: listing.shippingDetail!.isAvailable,
      regions: listing.shippingDetail!.regions,
      fee: shippingFee,
      estimatedDaysMin: listing.shippingDetail!.estimatedDaysMin,
      estimatedDaysMax: listing.shippingDetail!.estimatedDaysMax,
    },
    totals,
    commissionSettingLabel: commissionLabel(commissionRateBps),
  };
}

export { assertListingPurchasable };
