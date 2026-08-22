import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/config";
import {
  getUnreadNotificationCount,
  listNotifications,
} from "@/lib/services/notifications";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const summary = searchParams.get("summary") === "1";

  if (summary) {
    const unreadCount = await getUnreadNotificationCount(session.user.id);
    return NextResponse.json({ unreadCount });
  }

  const notifications = await listNotifications(session.user.id, 8);

  return NextResponse.json({
    unreadCount: notifications.filter((n) => n.readAt === null).length,
    notifications: notifications.map((notification) => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      link: notification.link,
      readAt: notification.readAt?.toISOString() ?? null,
      createdAt: notification.createdAt.toISOString(),
    })),
  });
}
