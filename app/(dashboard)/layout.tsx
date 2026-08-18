import Link from "next/link";

import { signOutAction } from "@/app/actions/auth";
import { requireAuth } from "@/lib/auth/guards";

export default async function DashboardLayout({
  children,
}: LayoutProps<"/">) {
  const session = await requireAuth();

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Wardrobe Vault
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/sell"
              className="text-foreground underline-offset-4 hover:underline"
            >
              My Listings
            </Link>
            <Link
              href="/sell/new"
              className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              New listing
            </Link>
            <span className="text-muted-foreground">{session.user.name ?? session.user.email}</span>
            <form action={signOutAction}>
              <button
                type="submit"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
