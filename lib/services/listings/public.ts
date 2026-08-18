import { withDbRetry } from "@/lib/db/with-retry";
import { ListingStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export const publicListingSelect = {
  id: true,
  title: true,
  brand: true,
  designer: true,
  price: true,
  currency: true,
  wornByName: true,
  wornByUserId: true,
  eventName: true,
  storyVerifiedByVault: true,
  authenticityVerifiedByVault: true,
  _count: { select: { favorites: true } },
  category: { select: { name: true, slug: true } },
  images: {
    orderBy: { sortOrder: "asc" as const },
    take: 1,
    select: { url: true, altText: true, width: true, height: true },
  },
  seller: {
    select: {
      id: true,
      name: true,
      isVerifiedPublicFigure: true,
      verificationStatus: true,
    },
  },
  wornBy: {
    select: {
      id: true,
      name: true,
      isVerifiedPublicFigure: true,
    },
  },
};

export type PublicListingCard = Awaited<
  ReturnType<typeof getRecentlyAddedListings>
>[number];

/** Recently published listings, newest first */
export async function getRecentlyAddedListings(limit = 6) {
  return withDbRetry(() =>
    prisma.listing.findMany({
      where: { status: ListingStatus.PUBLISHED },
      orderBy: { publishedAt: "desc" },
      take: limit,
      select: publicListingSelect,
    }),
  );
}

/** Most coveted = highest favorites count among published listings */
export async function getMostCovetedListings(limit = 6) {
  return withDbRetry(() =>
    prisma.listing.findMany({
      where: { status: ListingStatus.PUBLISHED },
      orderBy: [{ favorites: { _count: "desc" } }, { publishedAt: "desc" }],
      take: limit,
      select: publicListingSelect,
    }),
  );
}

/** Worn by verified public figures (linked wornBy user with isVerifiedPublicFigure) */
export async function getWornByIconsListings(limit = 6) {
  return withDbRetry(() =>
    prisma.listing.findMany({
      where: {
        status: ListingStatus.PUBLISHED,
        wornBy: { isVerifiedPublicFigure: true },
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
      select: publicListingSelect,
    }),
  );
}

export async function getFeaturedListings() {
  const [recentlyAdded, mostCoveted, wornByIcons] = await Promise.all([
    getRecentlyAddedListings(6),
    getMostCovetedListings(6),
    getWornByIconsListings(6),
  ]);

  return { recentlyAdded, mostCoveted, wornByIcons };
}
