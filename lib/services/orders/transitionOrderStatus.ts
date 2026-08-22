import {
  NotificationType,
  OrderStatus,
} from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { createNotifications } from "@/lib/services/notifications";

import { OrderServiceError } from "./errors";
import { assertOrderTransition } from "./stateMachine";

export type TransitionOrderStatusInput = {
  orderId: string;
  toStatus: OrderStatus;
  actorId: string;
  adminId?: string;
  trackingNumber?: string;
  trackingCarrier?: string;
  trackingUrl?: string;
};

function buildOrderNotifications(
  order: {
    id: string;
    orderNumber: string;
    buyerId: string;
    sellerId: string;
    items: { titleSnapshot: string }[];
  },
  toStatus: OrderStatus,
) {
  const itemTitle = order.items[0]?.titleSnapshot ?? "your piece";
  const orderLink = `/orders/${order.id}`;

  switch (toStatus) {
    case OrderStatus.SHIPPED:
      return [
        {
          userId: order.buyerId,
          type: NotificationType.ORDER_SHIPPED,
          title: "Your order has shipped",
          body: `${itemTitle} (${order.orderNumber}) is on its way.`,
          link: orderLink,
        },
      ];
    case OrderStatus.DELIVERED:
      return [
        {
          userId: order.buyerId,
          type: NotificationType.ORDER_DELIVERED,
          title: "Delivery confirmed",
          body: `${itemTitle} (${order.orderNumber}) has been delivered.`,
          link: orderLink,
        },
      ];
    default:
      return [];
  }
}

/**
 * Fulfillment status transitions for orders (admin/platform only).
 * Sends buyer notifications for shipped and delivered states.
 */
export async function transitionOrderStatus({
  orderId,
  toStatus,
  actorId,
  adminId,
  trackingNumber,
  trackingCarrier,
  trackingUrl,
}: TransitionOrderStatusInput) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { select: { titleSnapshot: true }, take: 1 },
    },
  });

  if (!order) {
    throw new OrderServiceError("Order not found.");
  }

  if (order.status === toStatus) {
    return { orderId, status: order.status };
  }

  try {
    assertOrderTransition(order.status, toStatus);
  } catch {
    throw new OrderServiceError(
      `Cannot move order ${order.orderNumber} from "${order.status}" to "${toStatus}".`,
    );
  }

  const now = new Date();
  const updateData: {
    status: OrderStatus;
    shippedAt?: Date;
    deliveredAt?: Date;
    completedAt?: Date;
    trackingNumber?: string | null;
    trackingCarrier?: string | null;
    trackingUrl?: string | null;
  } = { status: toStatus };

  if (toStatus === OrderStatus.SHIPPED) {
    updateData.shippedAt = now;
    updateData.trackingNumber = trackingNumber ?? order.trackingNumber;
    updateData.trackingCarrier = trackingCarrier ?? order.trackingCarrier;
    updateData.trackingUrl = trackingUrl ?? order.trackingUrl;
  }

  if (toStatus === OrderStatus.DELIVERED) {
    updateData.deliveredAt = now;
  }

  if (toStatus === OrderStatus.COMPLETED) {
    updateData.completedAt = now;
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: updateData,
    });

    const notifications = buildOrderNotifications(order, toStatus);
    if (notifications.length > 0) {
      await createNotifications(notifications, tx);
    }
  });

  if (adminId) {
    await prisma.adminAction.create({
      data: {
        adminId,
        action: "ORDER_STATUS_UPDATED",
        targetType: "Order",
        targetId: orderId,
        details: {
          fromStatus: order.status,
          toStatus,
          orderNumber: order.orderNumber,
        },
      },
    });
  }

  return { orderId, status: toStatus, actorId };
}
