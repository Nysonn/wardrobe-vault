import { prisma } from "@/lib/prisma";

export async function isListingFavorited(
  userId: string,
  listingId: string,
): Promise<boolean> {
  const favorite = await prisma.favorite.findUnique({
    where: {
      userId_listingId: { userId, listingId },
    },
    select: { id: true },
  });

  return favorite !== null;
}
