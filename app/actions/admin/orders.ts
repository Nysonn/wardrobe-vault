"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/guards";
import { resolveActionError } from "@/lib/errors/action-error";
import { OrderStatus } from "@/lib/generated/prisma/enums";
import {
  OrderServiceError,
  transitionOrderStatus,
} from "@/lib/services/orders";

export type AdminOrderActionState = {
  error?: string;
  success?: boolean;
};

export async function adminTransitionOrderAction(
  orderId: string,
  toStatus: OrderStatus,
): Promise<AdminOrderActionState> {
  const session = await requireAdmin();

  try {
    await transitionOrderStatus({
      orderId,
      toStatus,
      actorId: session.user.id,
      adminId: session.user.id,
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/orders/${orderId}`);

    return { success: true };
  } catch (error) {
    return resolveActionError(error, {
      context: "admin.orders.transition",
      serviceErrors: [OrderServiceError],
    });
  }
}
