"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SidebarNavLink = {
  href: string;
  label: string;
  exact?: boolean;
};

type DashboardSidebarLayoutProps = {
  title: string;
  links: readonly SidebarNavLink[];
  tone?: "vault" | "admin";
  sidebarFooter: React.ReactNode;
  topBar?: React.ReactNode;
  children: React.ReactNode;
};

function linkIsActive(pathname: string, link: SidebarNavLink) {
  if (link.exact) {
    return pathname === link.href;
  }

  return pathname === link.href || pathname.startsWith(`${link.href}/`);
}

export function DashboardSidebarLayout({
  title,
  links,
  tone = "vault",
  sidebarFooter,
  topBar,
  children,
}: DashboardSidebarLayoutProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = tone === "admin";

  return (
    <div
      className={cn(
        "flex min-h-full",
        isAdmin ? "bg-zinc-50 dark:bg-zinc-950" : "bg-background",
      )}
    >
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r transition-transform duration-300 ease-out lg:static lg:translate-x-0",
          isAdmin
            ? "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            : "border-border bg-card",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="border-b px-5 py-5">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className={cn(
              "text-[10px] font-medium uppercase tracking-[0.22em]",
              isAdmin ? "text-zinc-500" : "text-muted-foreground",
            )}
          >
            Wardrobe Vault
          </Link>
          <p
            className={cn(
              "mt-2 font-heading text-2xl tracking-tight",
              isAdmin ? "text-zinc-900 dark:text-zinc-100" : "text-foreground",
            )}
          >
            {title}
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {links.map((link) => {
              const active = linkIsActive(pathname, link);

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "block rounded-sm px-3 py-2 text-sm transition-colors",
                      active
                        ? isAdmin
                          ? "bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                          : "bg-muted font-medium text-foreground"
                        : isAdmin
                          ? "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div
          className={cn(
            "border-t px-5 py-4 text-sm",
            isAdmin
              ? "border-zinc-200 text-zinc-600 dark:border-zinc-800 dark:text-zinc-400"
              : "border-border text-muted-foreground",
          )}
        >
          {sidebarFooter}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className={cn(
            "flex h-14 shrink-0 items-center justify-between gap-4 border-b px-4 sm:px-6",
            isAdmin
              ? "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              : "border-border bg-background",
          )}
        >
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="lg:hidden"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? (
                <XIcon className="size-4" />
              ) : (
                <MenuIcon className="size-4" />
              )}
            </Button>
            <p
              className={cn(
                "font-heading text-lg lg:hidden",
                isAdmin ? "text-zinc-900 dark:text-zinc-100" : "text-foreground",
              )}
            >
              {title}
            </p>
          </div>

          {topBar ? <div className="flex items-center gap-3">{topBar}</div> : null}
        </header>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
