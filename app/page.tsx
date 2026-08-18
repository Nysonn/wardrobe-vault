import Link from "next/link";

import { EmptyState } from "@/components/brand/empty-state";
import { Container } from "@/components/layout/container";
import { PageShell } from "@/components/layout/page-shell";
import { Section } from "@/components/layout/section";
import { FeaturedSection } from "@/components/listings/featured-section";
import { Button } from "@/components/ui/button";
import { getFeaturedListings } from "@/lib/services/listings/public";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { recentlyAdded, mostCoveted, wornByIcons } =
    await getFeaturedListings();

  const vaultIsEmpty =
    recentlyAdded.length === 0 &&
    mostCoveted.length === 0 &&
    wornByIcons.length === 0;

  return (
    <PageShell>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <Section spacing="generous" className="border-b border-border">
        <Container className="animate-fade-in">
          <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-muted-foreground">
            Wardrobe Vault
          </p>
          <h1 className="mt-4 max-w-3xl font-heading text-5xl leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
            Own what has already been remembered.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
            A quiet marketplace for fashion with provenance — worn by notable
            people, held with care, offered to its next chapter.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button render={<Link href="/vault" />}>Explore the Vault</Button>
            <Button variant="outline" render={<Link href="/sell/new" />}>
              Sell a Piece
            </Button>
          </div>
        </Container>
      </Section>

      {/* ── Empty state when vault has no published listings ── */}
      {vaultIsEmpty && (
        <Section spacing="default">
          <Container>
            <EmptyState
              title="The Vault is quiet here."
              description="Curated listings will appear once the first pieces are submitted and approved."
            />
          </Container>
        </Section>
      )}

      {/* ── Recently Added ─────────────────────────────────────── */}
      {recentlyAdded.length > 0 && (
        <FeaturedSection
          label="New arrivals"
          title="Recently Added"
          listings={recentlyAdded}
          browseHref="/vault?sort=recent"
        />
      )}

      {/* ── Worn by Icons ──────────────────────────────────────── */}
      {wornByIcons.length > 0 && (
        <FeaturedSection
          label="Notable provenance"
          title="Worn by Icons"
          listings={wornByIcons}
          browseHref="/vault?filter=verified-figure"
        />
      )}

      {/* ── Most Coveted ───────────────────────────────────────── */}
      {mostCoveted.length > 0 && (
        <FeaturedSection
          label="Community favourites"
          title="Most Coveted"
          listings={mostCoveted}
          browseHref="/vault?sort=coveted"
        />
      )}

      {/* ── Sell CTA strip ─────────────────────────────────────── */}
      <Section className="border-t border-border bg-muted">
        <Container className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              For sellers
            </p>
            <h2 className="mt-1 font-heading text-2xl">
              Your wardrobe has a story.
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              List the pieces you no longer wear. Every item you submit is
              reviewed by our team and presented with the care it deserves.
            </p>
          </div>
          <Button
            variant="outline"
            className="shrink-0"
            render={<Link href="/sell/new" />}
          >
            Submit a Piece
          </Button>
        </Container>
      </Section>
    </PageShell>
  );
}
