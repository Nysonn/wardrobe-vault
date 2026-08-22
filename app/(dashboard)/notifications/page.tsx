import Link from "next/link";

import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/app/actions/notifications";
import { EmptyState } from "@/components/brand/empty-state";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth/guards";
import { listNotifications } from "@/lib/services/notifications";

export const dynamic = "force-dynamic";

function formatTimestamp(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

export default async function NotificationsPage() {
  const session = await requireAuth();
  const notifications = await listNotifications(session.user.id, 50);
  const unreadCount = notifications.filter((n) => n.readAt === null).length;

  return (
    <>
      <div className="border-b border-border py-6">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                Account
              </p>
              <h1 className="mt-2 font-heading text-3xl">Notifications</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : "You are up to date."}
              </p>
            </div>
            {unreadCount > 0 ? (
              <form action={markAllNotificationsReadAction}>
                <Button type="submit" variant="outline" size="sm">
                  Mark all read
                </Button>
              </form>
            ) : null}
          </div>
        </Container>
      </div>

      <Section spacing="default" className="pt-10">
        <Container>
          {notifications.length === 0 ? (
            <EmptyState
              title="Quiet for now."
              description="When something needs your attention — a sale, a shipment, a listing decision — it will appear here."
            />
          ) : (
            <ul className="divide-y divide-border border border-border">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={
                    notification.readAt === null ? "bg-muted/30" : undefined
                  }
                >
                  <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="max-w-2xl">
                      <p className="font-heading text-lg text-foreground">
                        {notification.title}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {notification.body}
                      </p>
                      <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {formatTimestamp(notification.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      {notification.link ? (
                        <Button
                          variant="outline"
                          size="sm"
                          render={<Link href={notification.link} />}
                        >
                          Open
                        </Button>
                      ) : null}
                      {notification.readAt === null ? (
                        <form
                          action={markNotificationReadAction.bind(
                            null,
                            notification.id,
                          )}
                        >
                          <Button type="submit" variant="ghost" size="sm">
                            Mark read
                          </Button>
                        </form>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </Section>
    </>
  );
}
