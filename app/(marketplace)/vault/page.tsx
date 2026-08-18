import type { Metadata } from "next";
import { Suspense } from "react";

import { EmptyState } from "@/components/brand/empty-state";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ItemCard } from "@/components/listings/item-card";
import { Pagination } from "@/components/listings/pagination";
import { SearchBar } from "@/components/listings/search-bar";
import { SearchFilters } from "@/components/listings/search-filters";
import { getActiveCategories } from "@/lib/services/listings/queries";
import { searchListings } from "@/lib/services/listings/search";
import { parseSearchParams } from "@/lib/schemas/search";

export const metadata: Metadata = {
  title: "Explore the Vault — Wardrobe Vault",
  description:
    "Browse fashion pieces with provenance — worn by notable people and offered with care.",
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function VaultPage({ searchParams }: Props) {
  const rawParams = await searchParams;
  const params = parseSearchParams(rawParams);

  const [{ listings, total, page, perPage, totalPages }, categories] =
    await Promise.all([searchListings(params), getActiveCategories()]);

  /** Rebuild the current URL params with a new page number */
  function buildPageHref(p: number) {
    const next = new URLSearchParams();
    if (params.q) next.set("q", params.q);
    if (params.brand) next.set("brand", params.brand);
    if (params.designer) next.set("designer", params.designer);
    if (params.categoryId) next.set("categoryId", params.categoryId);
    if (params.condition) next.set("condition", params.condition);
    if (params.priceMin !== undefined)
      next.set("priceMin", String(params.priceMin));
    if (params.priceMax !== undefined)
      next.set("priceMax", String(params.priceMax));
    if (params.verifiedFigure) next.set("verifiedFigure", "true");
    if (params.sort !== "recent") next.set("sort", params.sort);
    next.set("page", String(p));
    return `/vault?${next.toString()}`;
  }

  const hasQuery = !!(
    params.q ||
    params.brand ||
    params.designer ||
    params.categoryId ||
    params.condition ||
    params.priceMin !== undefined ||
    params.priceMax !== undefined ||
    params.verifiedFigure
  );

  return (
    <>
      {/* ── Page header ─────────────────────────────────────── */}
      <div className="border-b border-border py-10 sm:py-12">
        <Container>
          <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-muted-foreground">
            Wardrobe Vault
          </p>
          <h1 className="mt-2 font-heading text-3xl sm:text-4xl">
            Explore the Vault
          </h1>
          {total > 0 && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              {total.toLocaleString()} {total === 1 ? "piece" : "pieces"}
              {hasQuery ? " matching your search" : " available"}
            </p>
          )}
        </Container>
      </div>

      {/* ── Search bar ────────────────────────────────────────── */}
      <div className="border-b border-border bg-muted py-4">
        <Container>
          <Suspense>
            <SearchBar />
          </Suspense>
        </Container>
      </div>

      {/* ── Main layout: sidebar + grid ───────────────────────── */}
      <Section spacing="default">
        <Container>
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
            {/* Sidebar filters */}
            <div className="w-full shrink-0 lg:w-52 xl:w-60">
              <Suspense>
                <SearchFilters categories={categories} />
              </Suspense>
            </div>

            {/* Listing grid */}
            <div className="flex-1 min-w-0">
              {listings.length === 0 ? (
                <EmptyState
                  title="Nothing here yet."
                  description={
                    hasQuery
                      ? "No pieces match your search. Try adjusting your filters."
                      : "The Vault has no published pieces yet."
                  }
                />
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3">
                    {listings.map((listing) => (
                      <ItemCard key={listing.id} listing={listing} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-12 flex items-center justify-between gap-4 border-t border-border pt-8">
                      <p className="text-xs text-muted-foreground">
                        Page {page} of {totalPages}
                        {" · "}
                        Showing {(page - 1) * perPage + 1}–
                        {Math.min(page * perPage, total)} of {total}
                      </p>
                      <Pagination
                        page={page}
                        totalPages={totalPages}
                        buildHref={buildPageHref}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
