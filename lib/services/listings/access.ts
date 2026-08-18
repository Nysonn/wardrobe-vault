import { ListingStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

import { ListingServiceError } from "./errors";

/** Statuses a seller may edit before resubmitting. */
export const SELLER_EDITABLE_LISTING_STATUSES: readonly ListingStatus[] = [
  ListingStatus.DRAFT,
  ListingStatus.REJECTED,
];

export async function assertSellerOwnsListing(
  sellerId: string,
  listingId: string,
) {
  const listing = await prisma.listing.findFirst({
    where: { id: listingId, sellerId },
    select: {
      id: true,
      sellerId: true,
      status: true,
    },
  });

  if (!listing) {
    throw new ListingServiceError("Listing not found.");
  }

  return listing;
}

export function assertListingEditable(status: ListingStatus) {
  if (!SELLER_EDITABLE_LISTING_STATUSES.includes(status)) {
    throw new ListingServiceError(
      "This listing can no longer be edited. Contact support if you need help.",
    );
  }
}

export async function getDefaultCategoryId() {
  const category = await prisma.category.findFirst({
    where: { slug: "other", isActive: true },
    select: { id: true },
  });

  if (!category) {
    throw new ListingServiceError(
      "Categories are not configured. Run database seed before creating listings.",
    );
  }

  return category.id;
}

export async function assertCategoryExists(categoryId: string) {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, isActive: true },
    select: { id: true },
  });

  if (!category) {
    throw new ListingServiceError("Choose a valid category.");
  }
}
