import { prisma } from "@/lib/prisma";

export async function getSellerWalletOverview(sellerId: string) {
  const wallet = await prisma.wallet.upsert({
    where: { userId: sellerId },
    create: { userId: sellerId },
    update: {},
    select: {
      id: true,
      availableBalance: true,
      pendingBalance: true,
    },
  });

  const payouts = await prisma.payout.findMany({
    where: { sellerId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      grossAmount: true,
      commissionAmount: true,
      netAmount: true,
      currency: true,
      paidAt: true,
      createdAt: true,
      order: {
        select: {
          id: true,
          orderNumber: true,
          totalAmount: true,
          shippingFee: true,
          itemPrice: true,
          commissionAmount: true,
          placedAt: true,
          items: {
            take: 1,
            select: {
              titleSnapshot: true,
              listing: {
                select: {
                  images: {
                    orderBy: { sortOrder: "asc" },
                    take: 1,
                    select: { url: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const transactions = await prisma.walletTransaction.findMany({
    where: { walletId: wallet.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      type: true,
      amount: true,
      currency: true,
      description: true,
      createdAt: true,
    },
  });

  return { wallet, payouts, transactions };
}
