import Link from "next/link";

import { signOutAction } from "@/app/actions/auth";
import {
  DashboardSidebarLayout,
  type SidebarNavLink,
} from "@/components/layout/dashboard-sidebar-layout";
import { requireAdmin } from "@/lib/auth/guards";

const NAV_LINKS: readonly SidebarNavLink[] = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/listings", label: "Listings" },
  { href: "/admin/verification", label: "Verification" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/payouts", label: "Payouts" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/settings", label: "Settings" },
] as const;

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const session = await requireAdmin();

  return (
    <DashboardSidebarLayout
      title="Admin"
      links={NAV_LINKS}
      tone="admin"
      sidebarFooter={
        <>
          <p className="truncate">{session.user.email}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.14em]">
            {session.user.role}
          </p>
          <div className="mt-3 flex flex-col gap-2">
            <Link
              href="/"
              className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Marketplace
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Sign out
              </button>
            </form>
          </div>
        </>
      }
    >
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</div>
    </DashboardSidebarLayout>
  );
}
