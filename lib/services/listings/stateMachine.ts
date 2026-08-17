import { ListingStatus } from "@/lib/generated/prisma/client";

/**
 * Allowed listing status transitions (Phase 1.1).
 * Services must call `canTransitionListing` before persisting a status change.
 *
 * Flow reference: initial-prompt.md §16–§17
 */
export const LISTING_STATUS_TRANSITIONS: Readonly<
  Record<ListingStatus, readonly ListingStatus[]>
> = {
  [ListingStatus.DRAFT]: [
    ListingStatus.SUBMITTED,
    ListingStatus.ARCHIVED,
  ],
  [ListingStatus.SUBMITTED]: [
    ListingStatus.UNDER_REVIEW,
    ListingStatus.DRAFT,
    ListingStatus.ARCHIVED,
  ],
  [ListingStatus.UNDER_REVIEW]: [
    ListingStatus.APPROVED,
    ListingStatus.REJECTED,
    ListingStatus.DRAFT,
    ListingStatus.ARCHIVED,
  ],
  [ListingStatus.APPROVED]: [
    ListingStatus.PUBLISHED,
    ListingStatus.REJECTED,
    ListingStatus.ARCHIVED,
  ],
  [ListingStatus.REJECTED]: [
    ListingStatus.DRAFT,
    ListingStatus.SUBMITTED,
    ListingStatus.ARCHIVED,
  ],
  [ListingStatus.PUBLISHED]: [
    ListingStatus.SOLD,
    ListingStatus.SUSPENDED,
    ListingStatus.ARCHIVED,
  ],
  [ListingStatus.SOLD]: [ListingStatus.ARCHIVED],
  [ListingStatus.SUSPENDED]: [
    ListingStatus.PUBLISHED,
    ListingStatus.ARCHIVED,
  ],
  [ListingStatus.ARCHIVED]: [],
};

export function canTransitionListing(
  from: ListingStatus,
  to: ListingStatus,
): boolean {
  if (from === to) return true;
  return LISTING_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertListingTransition(
  from: ListingStatus,
  to: ListingStatus,
): void {
  if (!canTransitionListing(from, to)) {
    throw new Error(`Invalid listing status transition: ${from} → ${to}`);
  }
}

/** Statuses visible on the public marketplace browse/detail pages. */
export const PUBLIC_LISTING_STATUSES: readonly ListingStatus[] = [
  ListingStatus.PUBLISHED,
];

/** Statuses counted in a seller's active "under review" bucket. */
export const SELLER_REVIEW_LISTING_STATUSES: readonly ListingStatus[] = [
  ListingStatus.SUBMITTED,
  ListingStatus.UNDER_REVIEW,
  ListingStatus.APPROVED,
];
