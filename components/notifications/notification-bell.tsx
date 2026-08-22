"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BellIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

const POLL_INTERVAL_MS = 30_000;

function formatRelativeTime(iso: string) {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);

  const fetchNotifications = useCallback(async (includeList: boolean) => {
    const url = includeList
      ? "/api/notifications"
      : "/api/notifications?summary=1";

    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) return;

    const data = (await response.json()) as {
      unreadCount: number;
      notifications?: NotificationItem[];
    };

    setUnreadCount(data.unreadCount);

    if (data.notifications) {
      setNotifications(data.notifications);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      if (cancelled) return;
      await fetchNotifications(false);
    }

    void loadSummary();

    const interval = window.setInterval(() => {
      void loadSummary();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [fetchNotifications]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadList() {
      if (cancelled) return;
      await fetchNotifications(true);
    }

    void loadList();

    return () => {
      cancelled = true;
    };
  }, [open, fetchNotifications]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        className="relative inline-flex items-center justify-center rounded-none p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Notifications"
      >
        <BellIcon className="size-4" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center bg-vault-accent text-[9px] font-medium text-background">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="px-3 py-2">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Notifications
          </p>
        </div>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            Nothing new for now.
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem key={notification.id} className="p-0">
              {notification.link ? (
                <Link
                  href={notification.link}
                  className={cn(
                    "block w-full px-3 py-3 text-left transition-colors hover:bg-muted/50",
                    notification.readAt === null && "bg-muted/30",
                  )}
                  onClick={() => setOpen(false)}
                >
                  <NotificationPreview notification={notification} />
                </Link>
              ) : (
                <div
                  className={cn(
                    "block w-full px-3 py-3 text-left",
                    notification.readAt === null && "bg-muted/30",
                  )}
                >
                  <NotificationPreview notification={notification} />
                </div>
              )}
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="p-0">
          <Link
            href="/notifications"
            className="block w-full px-3 py-2 text-center text-xs uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
            onClick={() => setOpen(false)}
          >
            View all
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotificationPreview({
  notification,
}: {
  notification: NotificationItem;
}) {
  return (
    <>
      <p className="text-sm font-medium text-foreground">{notification.title}</p>
      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
        {notification.body}
      </p>
      <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        {formatRelativeTime(notification.createdAt)}
      </p>
    </>
  );
}
