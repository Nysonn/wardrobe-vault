"use client";

import Link from "next/link";
import { MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";

import { NotificationBell } from "@/components/notifications/notification-bell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DashboardNavProps = {
  userLabel: string;
  signOutAction: () => Promise<void>;
  className?: string;
};

const NAV_LINKS = [
  { href: "/sell", label: "My Listings" },
  { href: "/orders", label: "Orders" },
  { href: "/wallet", label: "Earnings" },
  { href: "/wishlist", label: "Saved" },
  { href: "/messages", label: "Messages" },
  { href: "/verify", label: "Verification" },
] as const;

export function DashboardNav({
  userLabel,
  signOutAction,
  className,
}: DashboardNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <nav className="hidden items-center gap-5 text-sm lg:flex">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/sell/new"
          className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          New listing
        </Link>
        <NotificationBell />
        <span className="hidden text-muted-foreground xl:inline">{userLabel}</span>
        <form action={signOutAction}>
          <button
            type="submit"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign out
          </button>
        </form>
      </nav>

      <div className="flex items-center gap-3 lg:hidden">
        <NotificationBell />
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-expanded={open}
          aria-controls="dashboard-mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <XIcon className="size-4" /> : <MenuIcon className="size-4" />}
        </Button>
      </div>

      {open ? (
        <div
          id="dashboard-mobile-menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 rounded-sm border border-border bg-background p-4 shadow-sm lg:hidden"
        >
          <nav className="flex flex-col gap-3 text-sm">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/sell/new"
              onClick={() => setOpen(false)}
              className="text-foreground"
            >
              New listing
            </Link>
            <p className="border-t border-border pt-3 text-xs text-muted-foreground">
              {userLabel}
            </p>
            <form action={signOutAction}>
              <button
                type="submit"
                className="text-left text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign out
              </button>
            </form>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
