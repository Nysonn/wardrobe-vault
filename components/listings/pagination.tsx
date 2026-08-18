import Link from "next/link";

import { cn } from "@/lib/utils";

type PaginationProps = {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
  className?: string;
};

/**
 * Page-number pagination (tech-spec §2 — no infinite scroll).
 * Renders: Prev · 1 2 3 … N · Next
 */
export function Pagination({
  page,
  totalPages,
  buildHref,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Build a compact window: always show first, last, and up to 5 around current
  const pages: (number | "…")[] = [];
  const delta = 2;
  const left = Math.max(2, page - delta);
  const right = Math.min(totalPages - 1, page + delta);

  pages.push(1);
  if (left > 2) pages.push("…");
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < totalPages - 1) pages.push("…");
  if (totalPages > 1) pages.push(totalPages);

  const linkClass = (active: boolean, disabled = false) =>
    cn(
      "inline-flex h-8 min-w-8 items-center justify-center px-2.5",
      "text-xs uppercase tracking-[0.14em] border border-border transition-colors",
      active
        ? "bg-foreground text-background border-foreground"
        : "bg-background text-muted-foreground hover:text-foreground hover:bg-muted",
      disabled && "pointer-events-none opacity-40",
    );

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex flex-wrap items-center gap-1", className)}
    >
      <Link
        href={buildHref(page - 1)}
        aria-disabled={page === 1}
        className={linkClass(false, page === 1)}
      >
        ← Prev
      </Link>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className={linkClass(false, true)}>
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(p)}
            aria-current={p === page ? "page" : undefined}
            className={linkClass(p === page)}
          >
            {p}
          </Link>
        ),
      )}

      <Link
        href={buildHref(page + 1)}
        aria-disabled={page === totalPages}
        className={linkClass(false, page === totalPages)}
      >
        Next →
      </Link>
    </nav>
  );
}
