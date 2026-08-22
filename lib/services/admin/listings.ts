import { ListingStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/services/notifications";
import { canTransitionListing } from "@/lib/services/listings/stateMachine";
import { transitionListingStatus } from "@/lib/services/listings/transitionStatus";

export type AdminListingTab = "pending" | "approved" | "all";

export type AdminListingAction =
  | "start-review"
  | "approve"
  | "reject"
  | "request-changes"
  | "suspend"
  | "archive"
  | "add-note";

export class AdminListingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminListingError";
  }
}

function tabToStatuses(tab: AdminListingTab): ListingStatus[] {
  switch (tab) {
    case "pending":
      return [ListingStatus.SUBMITTED, ListingStatus.UNDER_REVIEW];
    case "approved":
      return [ListingStatus.APPROVED];
    case "all":
      return [
        ListingStatus.SUBMITTED,
        ListingStatus.UNDER_REVIEW,
        ListingStatus.APPROVED,
        ListingStatus.PUBLISHED,
        ListingStatus.SUSPENDED,
        ListingStatus.REJECTED,
      ];
    default:
      return [ListingStatus.SUBMITTED, ListingStatus.UNDER_REVIEW];
  }
}

export async function getAdminListingQueueCounts() {
  const [submitted, underReview, approved] = await Promise.all([
    prisma.listing.count({ where: { status: ListingStatus.SUBMITTED } }),
    prisma.listing.count({ where: { status: ListingStatus.UNDER_REVIEW } }),
    prisma.listing.count({ where: { status: ListingStatus.APPROVED } }),
  ]);

  return {
    pending: submitted + underReview,
    submitted,
    "under-review": underReview,
    approved,
  } as const;
}

export async function getAdminListingQueue(tab: AdminListingTab) {
  const statuses = tabToStatuses(tab);

  return prisma.listing.findMany({
    where: { status: { in: statuses } },
    orderBy: [{ submittedAt: "asc" }, { createdAt: "asc" }],
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      category: { select: { id: true, name: true } },
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: { url: true, altText: true },
      },
    },
  });
}

export async function getAdminListingDetail(listingId: string) {
  return prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
          verificationStatus: true,
          isVerifiedPublicFigure: true,
        },
      },
      category: { select: { id: true, name: true } },
      images: { orderBy: { sortOrder: "asc" } },
      documents: { orderBy: { createdAt: "asc" } },
      shippingDetail: true,
      statusHistory: {
        orderBy: { createdAt: "asc" },
        include: {
          actor: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });
}

type AdminActionInput = {
  adminId: string;
  listingId: string;
  action: AdminListingAction;
  reason?: string;
  notes?: string;
};

/** Maps an admin action to the listing status it should transition to (if any). */
function actionToStatus(
  action: AdminListingAction,
): ListingStatus | null {
  switch (action) {
    case "start-review":
      return ListingStatus.UNDER_REVIEW;
    case "approve":
      return ListingStatus.APPROVED;
    case "reject":
      return ListingStatus.REJECTED;
    case "request-changes":
      return ListingStatus.DRAFT;
    case "suspend":
      return ListingStatus.SUSPENDED;
    case "archive":
      return ListingStatus.ARCHIVED;
    case "add-note":
      return null;
  }
}

/** Human-readable admin action labels for the audit log. */
const ACTION_LABELS: Record<AdminListingAction, string> = {
  "start-review": "Listing review started",
  approve: "Listing approved",
  reject: "Listing rejected",
  "request-changes": "Changes requested on listing",
  suspend: "Listing suspended",
  archive: "Listing archived",
  "add-note": "Internal note added to listing",
};

/**
 * Perform an admin moderation action on a listing.
 * - Enforces state-machine transitions.
 * - Writes an AdminAction audit record.
 * - Writes an internal adminNotes update when notes are provided.
 * - Creates a Notification for the seller when relevant.
 */
export async function performAdminListingAction({
  adminId,
  listingId,
  action,
  reason,
  notes,
}: AdminActionInput) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      title: true,
      status: true,
      sellerId: true,
      adminNotes: true,
    },
  });

  if (!listing) {
    throw new AdminListingError("Listing not found.");
  }

  const toStatus = actionToStatus(action);

  if (toStatus !== null) {
    if (!canTransitionListing(listing.status, toStatus)) {
      throw new AdminListingError(
        `Cannot ${action} a listing with status "${listing.status}".`,
      );
    }
    // Transition via the shared service (also writes status history)
    await transitionListingStatus({
      listingId,
      toStatus,
      actorId: adminId,
      reason,
      notes,
    });
  }

  // Update internal admin notes if provided
  if (notes && action === "add-note") {
    const updated = listing.adminNotes
      ? `${listing.adminNotes}\n\n---\n\n${notes}`
      : notes;
    await prisma.listing.update({
      where: { id: listingId },
      data: { adminNotes: updated },
    });
  }

  // Write admin audit log
  await prisma.adminAction.create({
    data: {
      adminId,
      action: ACTION_LABELS[action],
      targetType: "Listing",
      targetId: listingId,
      details: {
        listingTitle: listing.title,
        fromStatus: listing.status,
        toStatus,
        reason: reason ?? null,
        notes: notes ?? null,
      },
    },
  });

  // Notify the seller for actions that affect their listing
  const sellerNotification = buildSellerNotification(
    action,
    listing.id,
    listing.title,
    reason,
  );
  if (sellerNotification) {
    await createNotification({
      userId: listing.sellerId,
      ...sellerNotification,
    });
  }

  return { success: true };
}

type NotificationPayload = {
  type: import("@/lib/generated/prisma/enums").NotificationType;
  title: string;
  body: string;
  link: string;
};

function buildSellerNotification(
  action: AdminListingAction,
  listingId: string,
  listingTitle: string,
  reason?: string,
): NotificationPayload | null {
  const link = `/sell/${listingId}`;
  switch (action) {
    case "approve":
      return {
        type: "LISTING_APPROVED" as const,
        title: "Your listing has been approved",
        body: `"${listingTitle}" has been approved and will be published to the marketplace shortly.`,
        link,
      };
    case "reject":
      return {
        type: "LISTING_REJECTED" as const,
        title: "Your listing needs attention",
        body: reason
          ? `"${listingTitle}" was not approved: ${reason}`
          : `"${listingTitle}" was not approved. Open the listing to review the feedback and resubmit.`,
        link,
      };
    case "request-changes":
      return {
        type: "LISTING_NEEDS_CHANGES" as const,
        title: "Changes requested on your listing",
        body: reason
          ? `"${listingTitle}": ${reason}`
          : `"${listingTitle}" has been returned to you for revisions. Open the listing to make changes.`,
        link,
      };
    default:
      return null;
  }
}
