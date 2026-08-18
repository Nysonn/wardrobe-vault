import { withDbRetry } from "@/lib/db/with-retry";
import { ListingStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

/** Fields exposed on the public item detail page (PUBLISHED or SOLD only). */
const publicListingDetailSelect = {
  id: true,
  title: true,
  brand: true,
  designer: true,
  price: true,
  currency: true,
  size: true,
  color: true,
  material: true,
  condition: true,
  wornByName: true,
  wornByUserId: true,
  wornBySeller: true,
  wornWhere: true,
  eventName: true,
  eventDate: true,
  timesWorn: true,
  storyDetails: true,
  storyVerifiedByVault: true,
  authenticityNotes: true,
  authenticityVerifiedByVault: true,
  status: true,
  publishedAt: true,
  soldAt: true,
  category: { select: { name: true, slug: true } },
  images: {
    orderBy: { sortOrder: "asc" as const },
    select: {
      id: true,
      url: true,
      altText: true,
      width: true,
      height: true,
      sortOrder: true,
    },
  },
  documents: {
    select: {
      id: true,
      type: true,
      fileName: true,
      mimeType: true,
    },
  },
  shippingDetail: {
    select: {
      isAvailable: true,
      regions: true,
      fee: true,
      estimatedDaysMin: true,
      estimatedDaysMax: true,
      notes: true,
    },
  },
  seller: {
    select: {
      id: true,
      name: true,
      isVerifiedPublicFigure: true,
      verificationStatus: true,
      profile: {
        select: {
          headline: true,
          region: true,
          location: true,
          photoUrl: true,
        },
      },
    },
  },
  wornBy: {
    select: {
      id: true,
      name: true,
      isVerifiedPublicFigure: true,
      profile: {
        select: {
          headline: true,
          region: true,
          location: true,
          photoUrl: true,
        },
      },
    },
  },
} as const;

export type PublicListingDetail = NonNullable<
  Awaited<ReturnType<typeof getPublicListingDetail>>
>;

const PUBLIC_DETAIL_STATUSES: readonly ListingStatus[] = [
  ListingStatus.PUBLISHED,
  ListingStatus.SOLD,
];

/** Fetch a single listing for the public detail page. Returns null when not found or not public. */
export async function getPublicListingDetail(listingId: string) {
  return withDbRetry(() =>
    prisma.listing.findFirst({
      where: {
        id: listingId,
        status: { in: [...PUBLIC_DETAIL_STATUSES] },
      },
      select: publicListingDetailSelect,
    }),
  );
}
