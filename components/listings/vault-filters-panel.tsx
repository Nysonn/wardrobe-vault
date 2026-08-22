"use client";

import { useState } from "react";

import { SearchFilters } from "@/components/listings/search-filters";
import { cn } from "@/lib/utils";

type Category = { id: string; name: string; slug: string };

type VaultFiltersPanelProps = {
  categories: Category[];
};

export function VaultFiltersPanel({ categories }: VaultFiltersPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full shrink-0 lg:w-52 xl:w-60">
      <button
        type="button"
        className="mb-4 flex w-full items-center justify-between border border-border bg-muted px-4 py-3 text-left text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground lg:hidden"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span>Filters & sort</span>
        <span>{open ? "Hide" : "Show"}</span>
      </button>

      <div className={cn(!open && "hidden lg:block")}>
        <SearchFilters categories={categories} />
      </div>
    </div>
  );
}
