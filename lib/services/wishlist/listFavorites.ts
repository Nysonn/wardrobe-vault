import { ListingStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { publicListingSelect } from "@/lib/services/listings/public";

export async function listUserFavorites(userId: string) {
  const favorites = await prisma.favorite.findMany({
    where: {
      userId,
      listing: {
        status: { in: [ListingStatus.PUBLISHED, ListingStatus.SOLD] },
      },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      listing: {
        select: {
          ...publicListingSelect,
          status: true,
        },
      },
    },
  });

  return favorites.map((favorite) => ({
    favoriteId: favorite.id,
    savedAt: favorite.createdAt,
    listing: favorite.listing,
  }));
}
