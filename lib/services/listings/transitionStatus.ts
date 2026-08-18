import { ListingStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { assertListingTransition } from "@/lib/services/listings/stateMachine";

import { ListingServiceError } from "./errors";

type TransitionListingStatusInput = {
  listingId: string;
  toStatus: ListingStatus;
  actorId?: string;
  reason?: string;
  notes?: string;
};

export async function transitionListingStatus({
  listingId,
  toStatus,
  actorId,
  reason,
  notes,
}: TransitionListingStatusInput) {
  return prisma.$transaction(async (tx) => {
    const listing = await tx.listing.findUnique({
      where: { id: listingId },
      select: { id: true, status: true },
    });

    if (!listing) {
      throw new ListingServiceError("Listing not found.");
    }

    if (listing.status === toStatus) {
      return listing;
    }

    try {
      assertListingTransition(listing.status, toStatus);
    } catch {
      throw new ListingServiceError("This listing status change is not allowed.");
    }

    const now = new Date();
    const timestamps: {
      submittedAt?: Date;
      publishedAt?: Date;
      soldAt?: Date;
      rejectionReason?: string | null;
    } = {};

    if (toStatus === ListingStatus.SUBMITTED) {
      timestamps.submittedAt = now;
      timestamps.rejectionReason = null;
    }

    if (toStatus === ListingStatus.PUBLISHED) {
      timestamps.publishedAt = now;
    }

    if (toStatus === ListingStatus.SOLD) {
      timestamps.soldAt = now;
    }

    if (toStatus === ListingStatus.REJECTED && reason) {
      timestamps.rejectionReason = reason;
    }

    const updated = await tx.listing.update({
      where: { id: listingId },
      data: {
        status: toStatus,
        ...timestamps,
      },
      select: { id: true, status: true },
    });

    await tx.listingStatusHistory.create({
      data: {
        listingId,
        fromStatus: listing.status,
        toStatus,
        actorId: actorId ?? null,
        reason: reason ?? null,
        notes: notes ?? null,
      },
    });

    return updated;
  });
}
