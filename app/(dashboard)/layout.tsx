import Link from "next/link";

import { signOutAction } from "@/app/actions/auth";
import {
  DashboardSidebarLayout,
  type SidebarNavLink,
} from "@/components/layout/dashboard-sidebar-layout";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { requireAuth } from "@/lib/auth/guards";

const NAV_LINKS: readonly SidebarNavLink[] = [
  { href: "/sell", label: "My listings" },
  { href: "/orders", label: "Orders" },
  { href: "/wallet", label: "Earnings" },
  { href: "/wishlist", label: "Saved" },
  { href: "/messages", label: "Messages" },
  { href: "/verify", label: "Verification" },
  { href: "/sell/new", label: "New listing" },
] as const;

export default async function DashboardLayout({
  children,
}: LayoutProps<"/">) {
  const session = await requireAuth();
  const userLabel = session.user.name ?? session.user.email ?? "Member";

  return (
    <DashboardSidebarLayout
      title="My Vault"
      links={NAV_LINKS}
      tone="vault"
      topBar={<NotificationBell />}
      sidebarFooter={
        <>
          <p className="truncate text-foreground">{userLabel}</p>
          <div className="mt-3 flex flex-col gap-2">
            <Link
              href="/vault"
              className="transition-colors hover:text-foreground"
            >
              Browse the Vault
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="transition-colors hover:text-foreground"
              >
                Sign out
              </button>
            </form>
          </div>
        </>
      }
    >
      {children}
    </DashboardSidebarLayout>
  );
}
