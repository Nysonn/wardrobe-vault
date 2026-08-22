"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/guards";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/services/notifications";

export async function markNotificationReadAction(notificationId: string) {
  const session = await requireAuth();
  await markNotificationRead(session.user.id, notificationId);
  revalidatePath("/notifications");
}

export async function markAllNotificationsReadAction() {
  const session = await requireAuth();
  await markAllNotificationsRead(session.user.id);
  revalidatePath("/notifications");
}
