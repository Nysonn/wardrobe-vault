"use client";

import Link from "next/link";
import { MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SiteHeaderMenuProps = {
  isAuthenticated: boolean;
  dashboardHref?: string;
};

const PUBLIC_LINKS = [
  { href: "/vault", label: "Explore" },
  { href: "/sell/new", label: "Sell" },
] as const;

export function SiteHeaderMenu({
  isAuthenticated,
  dashboardHref = "/sell",
}: SiteHeaderMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="hidden items-center gap-6 text-sm md:flex">
        {PUBLIC_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            {link.label}
          </Link>
        ))}
        {isAuthenticated ? (
          <Link
            href={dashboardHref}
            className="text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            My Vault
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Sign in
            </Link>
            <Button size="sm" render={<Link href="/register" />}>
              Join
            </Button>
          </>
        )}
      </nav>

      <div className="md:hidden">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-expanded={open}
          aria-controls="site-mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <XIcon className="size-4" /> : <MenuIcon className="size-4" />}
        </Button>
      </div>

      {open ? (
        <div
          id="site-mobile-menu"
          className="absolute inset-x-0 top-full z-50 border-b border-border bg-background px-4 py-6 shadow-sm md:hidden"
        >
          <nav className="flex flex-col gap-4 text-sm">
            {PUBLIC_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-foreground"
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <Link
                href={dashboardHref}
                onClick={() => setOpen(false)}
                className="text-foreground"
              >
                My Vault
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="text-foreground"
                >
                  Sign in
                </Link>
                <Button
                  className={cn("w-full")}
                  render={<Link href="/register" onClick={() => setOpen(false)} />}
                >
                  Join
                </Button>
              </>
            )}
          </nav>
        </div>
      ) : null}
    </>
  );
}
