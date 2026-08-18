import { prisma } from "@/lib/prisma";

import { OrderServiceError } from "./errors";

export async function getOrderForBuyer(orderId: string, buyerId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          isVerifiedPublicFigure: true,
        },
      },
      items: {
        include: {
          listing: {
            select: {
              id: true,
              images: {
                orderBy: { sortOrder: "asc" },
                take: 1,
                select: { url: true },
              },
            },
          },
        },
      },
      payments: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          status: true,
          provider: true,
          amount: true,
        },
      },
    },
  });

  if (!order) {
    return null;
  }

  if (order.buyerId !== buyerId) {
    throw new OrderServiceError("You do not have access to this order.");
  }

  return order;
}

export async function listOrdersForBuyer(buyerId: string) {
  return prisma.order.findMany({
    where: { buyerId },
    orderBy: { placedAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      totalAmount: true,
      currency: true,
      placedAt: true,
      items: {
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
  });
}
