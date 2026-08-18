"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { cn } from "@/lib/utils";
import {
  listingConditions,
  searchSortOptions,
} from "@/lib/schemas/search";

const conditionLabels: Record<string, string> = {
  NEW_WITH_TAGS: "New with tags",
  EXCELLENT: "Excellent",
  VERY_GOOD: "Very good",
  GOOD: "Good",
  FAIR: "Fair",
  WELL_LOVED: "Well loved",
};

const sortLabels: Record<string, string> = {
  recent: "Recently added",
  coveted: "Most coveted",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
};

type Category = { id: string; name: string; slug: string };

type SearchFiltersProps = {
  categories: Category[];
  className?: string;
};

/**
 * Sidebar filter panel (client component).
 * Each control writes to URL search params — no local state cache.
 */
export function SearchFilters({ categories, className }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    startTransition(() => {
      router.push(`/vault?${params.toString()}`);
    });
  }

  function clearAll() {
    startTransition(() => {
      router.push("/vault");
    });
  }

  const current = {
    sort: searchParams.get("sort") ?? "recent",
    categoryId: searchParams.get("categoryId") ?? "",
    condition: searchParams.get("condition") ?? "",
    priceMin: searchParams.get("priceMin") ?? "",
    priceMax: searchParams.get("priceMax") ?? "",
    verifiedFigure: searchParams.get("verifiedFigure") === "true",
  };

  const hasActiveFilters =
    !!searchParams.get("categoryId") ||
    !!searchParams.get("condition") ||
    !!searchParams.get("priceMin") ||
    !!searchParams.get("priceMax") ||
    searchParams.get("verifiedFigure") === "true";

  return (
    <aside
      className={cn(
        "flex flex-col gap-6 text-sm",
        isPending && "pointer-events-none opacity-60",
        className,
      )}
    >
      {/* Sort */}
      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Sort by
        </p>
        <div className="flex flex-col gap-1">
          {searchSortOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setParam("sort", opt)}
              className={cn(
                "text-left text-xs transition-colors",
                current.sort === opt
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {sortLabels[opt]}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-border" />

      {/* Category */}
      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Category
        </p>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setParam("categoryId", null)}
            className={cn(
              "text-left text-xs transition-colors",
              !current.categoryId
                ? "font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setParam("categoryId", cat.id)}
              className={cn(
                "text-left text-xs transition-colors",
                current.categoryId === cat.id
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-border" />

      {/* Condition */}
      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Condition
        </p>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setParam("condition", null)}
            className={cn(
              "text-left text-xs transition-colors",
              !current.condition
                ? "font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Any
          </button>
          {listingConditions.map((c) => (
            <button
              key={c}
              onClick={() => setParam("condition", c)}
              className={cn(
                "text-left text-xs transition-colors",
                current.condition === c
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {conditionLabels[c]}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-border" />

      {/* Price range */}
      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Price (UGX)
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            defaultValue={current.priceMin}
            min={0}
            onBlur={(e) =>
              setParam("priceMin", e.target.value || null)
            }
            className="w-full border border-border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <span className="text-muted-foreground">–</span>
          <input
            type="number"
            placeholder="Max"
            defaultValue={current.priceMax}
            min={0}
            onBlur={(e) =>
              setParam("priceMax", e.target.value || null)
            }
            className="w-full border border-border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      <hr className="border-border" />

      {/* Verified figure */}
      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Provenance
        </p>
        <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <input
            type="checkbox"
            checked={current.verifiedFigure}
            onChange={(e) =>
              setParam("verifiedFigure", e.target.checked ? "true" : null)
            }
            className="accent-foreground"
          />
          Worn by verified public figure
        </label>
      </div>

      {/* Clear all */}
      {hasActiveFilters && (
        <>
          <hr className="border-border" />
          <button
            onClick={clearAll}
            className="text-left text-[10px] uppercase tracking-[0.16em] text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
          >
            Clear all filters
          </button>
        </>
      )}
    </aside>
  );
}
