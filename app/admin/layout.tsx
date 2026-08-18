import Link from "next/link";

import { signOutAction } from "@/app/actions/auth";
import { requireAdmin } from "@/lib/auth/guards";

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const session = await requireAdmin();

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-medium tracking-[0.18em] uppercase text-zinc-500">
              Wardrobe Vault
            </p>
            <h1 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
              Admin
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
            <Link href="/admin/listings" className="hover:text-zinc-900 dark:hover:text-zinc-100">
              Listings
            </Link>
            <Link href="/admin/payouts" className="hover:text-zinc-900 dark:hover:text-zinc-100">
              Payouts
            </Link>
            <Link
              href="/admin/settings/commission"
              className="hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Commission
            </Link>
            <span>{session.user.email}</span>
            <span className="rounded-full border px-2 py-0.5 text-xs uppercase tracking-wide">
              {session.user.role}
            </span>
            <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100">
              Marketplace
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
