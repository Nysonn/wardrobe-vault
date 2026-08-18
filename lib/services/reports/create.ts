import { ListingStatus, ReportStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import {
  reportListingInputSchema,
  type ReportListingInput,
} from "@/lib/schemas/report";

export class ReportServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReportServiceError";
  }
}

const PUBLIC_LISTING_STATUSES: readonly ListingStatus[] = [
  ListingStatus.PUBLISHED,
  ListingStatus.SOLD,
];

export async function reportListing({
  reporterId,
  data,
}: {
  reporterId: string;
  data: ReportListingInput;
}) {
  const parsed = reportListingInputSchema.safeParse(data);
  if (!parsed.success) {
    throw new ReportServiceError(
      parsed.error.issues[0]?.message ?? "Please check your report details.",
    );
  }

  const { listingId, reason, details } = parsed.data;

  const listing = await prisma.listing.findFirst({
    where: {
      id: listingId,
      status: { in: [...PUBLIC_LISTING_STATUSES] },
    },
    select: { id: true, sellerId: true },
  });

  if (!listing) {
    throw new ReportServiceError("This listing is no longer available.");
  }

  if (listing.sellerId === reporterId) {
    throw new ReportServiceError("You cannot report your own listing.");
  }

  const existingOpen = await prisma.report.findFirst({
    where: {
      reporterId,
      listingId,
      status: { in: [ReportStatus.OPEN, ReportStatus.UNDER_REVIEW] },
    },
    select: { id: true },
  });

  if (existingOpen) {
    throw new ReportServiceError(
      "You already have an open report for this listing. Our team is reviewing it.",
    );
  }

  return prisma.report.create({
    data: {
      reporterId,
      listingId,
      reason,
      details: details?.trim() || null,
    },
    select: { id: true },
  });
}
