import { withDbRetry } from "@/lib/db/with-retry";
import { ListingStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import {
  publicListingSelect,
  type PublicListingCard,
} from "@/lib/services/listings/public";

export type PublicUserProfile = NonNullable<
  Awaited<ReturnType<typeof getPublicUserProfile>>
>;

export type PublicProfileListings = {
  active: PublicListingCard[];
  sold: PublicListingCard[];
};

const publicUserSelect = {
  id: true,
  name: true,
  image: true,
  isVerifiedPublicFigure: true,
  verificationStatus: true,
  profile: {
    select: {
      bio: true,
      publicFigureBio: true,
      headline: true,
      location: true,
      region: true,
      photoUrl: true,
      websiteUrl: true,
      instagramHandle: true,
    },
  },
} as const;

/** Public seller profile for marketplace pages. Returns null when user not found or suspended. */
export async function getPublicUserProfile(userId: string) {
  const user = await withDbRetry(() =>
    prisma.user.findFirst({
      where: {
        id: userId,
        suspendedAt: null,
      },
      select: publicUserSelect,
    }),
  );

  if (!user) {
    return null;
  }

  const [active, sold] = await Promise.all([
    withDbRetry(() =>
      prisma.listing.findMany({
        where: {
          sellerId: userId,
          status: ListingStatus.PUBLISHED,
        },
        orderBy: { publishedAt: "desc" },
        select: publicListingSelect,
      }),
    ),
    withDbRetry(() =>
      prisma.listing.findMany({
        where: {
          sellerId: userId,
          status: ListingStatus.SOLD,
        },
        orderBy: { soldAt: "desc" },
        select: publicListingSelect,
      }),
    ),
  ]);

  return {
    user,
    listings: { active, sold },
  };
}
