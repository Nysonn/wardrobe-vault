import { ListingStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

import { WishlistServiceError } from "./errors";

export type ToggleFavoriteResult = {
  favorited: boolean;
};

export async function addFavorite(
  userId: string,
  listingId: string,
): Promise<ToggleFavoriteResult> {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, status: true, sellerId: true },
  });

  if (!listing) {
    throw new WishlistServiceError("This piece could not be found.");
  }

  if (listing.status !== ListingStatus.PUBLISHED) {
    throw new WishlistServiceError("Only available pieces can be saved.");
  }

  if (listing.sellerId === userId) {
    throw new WishlistServiceError("You cannot save your own listing.");
  }

  await prisma.favorite.upsert({
    where: {
      userId_listingId: { userId, listingId },
    },
    create: { userId, listingId },
    update: {},
  });

  return { favorited: true };
}

export async function removeFavorite(
  userId: string,
  listingId: string,
): Promise<ToggleFavoriteResult> {
  await prisma.favorite.deleteMany({
    where: { userId, listingId },
  });

  return { favorited: false };
}
