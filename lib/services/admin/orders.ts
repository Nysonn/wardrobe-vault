import { OrderStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export type AdminOrderTab = "active" | "disputed" | "completed" | "all";

function tabToStatuses(tab: AdminOrderTab): OrderStatus[] {
  switch (tab) {
    case "active":
      return [
        OrderStatus.ORDER_PLACED,
        OrderStatus.PAYMENT_CONFIRMED,
        OrderStatus.AWAITING_SELLER,
        OrderStatus.SHIPPED,
        OrderStatus.IN_TRANSIT,
        OrderStatus.DELIVERED,
      ];
    case "disputed":
      return [OrderStatus.DISPUTED];
    case "completed":
      return [OrderStatus.COMPLETED];
    case "all":
      return Object.values(OrderStatus);
    default:
      return [OrderStatus.AWAITING_SELLER];
  }
}

export async function getAdminOrderQueueCounts() {
  const [active, disputed, completed] = await Promise.all([
    prisma.order.count({
      where: { status: { in: tabToStatuses("active") } },
    }),
    prisma.order.count({ where: { status: OrderStatus.DISPUTED } }),
    prisma.order.count({ where: { status: OrderStatus.COMPLETED } }),
  ]);

  return { active, disputed, completed };
}

export async function getAdminOrderQueue(tab: AdminOrderTab) {
  return prisma.order.findMany({
    where: { status: { in: tabToStatuses(tab) } },
    orderBy: { placedAt: "desc" },
    take: 50,
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      payoutStatus: true,
      totalAmount: true,
      commissionAmount: true,
      placedAt: true,
      buyer: { select: { id: true, name: true, email: true } },
      seller: { select: { id: true, name: true, email: true } },
      items: {
        take: 1,
        select: { titleSnapshot: true },
      },
    },
  });
}

export async function getAdminOrderDetail(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      buyer: { select: { id: true, name: true, email: true } },
      seller: { select: { id: true, name: true, email: true } },
      items: {
        select: {
          titleSnapshot: true,
          price: true,
          listing: {
            select: {
              id: true,
              images: {
                take: 1,
                orderBy: { sortOrder: "asc" },
                select: { url: true },
              },
            },
          },
        },
      },
      payout: { select: { id: true, status: true, netAmount: true } },
    },
  });
}
