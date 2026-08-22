import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ItemCard } from "@/components/listings/item-card";
import type { PublicListingCard } from "@/lib/services/listings/public";
import { cn } from "@/lib/utils";

type FeaturedSectionProps = {
  label: string;
  title: string;
  listings: PublicListingCard[];
  browseHref?: string;
  className?: string;
};

/**
 * Curated homepage section (master prompt §9).
 * Editorial title, horizontal-scroll on mobile, 3-col grid on desktop.
 * Intentionally not a dense grid — quiet luxury means breathing room.
 */
export function FeaturedSection({
  label,
  title,
  listings,
  browseHref,
  className,
}: FeaturedSectionProps) {
  if (listings.length === 0) return null;

  return (
    <Section className={cn("border-t border-border", className)}>
      <Container>
        {/* Section header */}
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              {label}
            </p>
            <h2 className="mt-1 font-heading text-2xl sm:text-3xl">{title}</h2>
          </div>
          {browseHref && (
            <Link
              href={browseHref}
              className="shrink-0 text-xs uppercase tracking-[0.16em] text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
            >
              See all
            </Link>
          )}
        </div>

        {/* Cards — horizontal scroll on mobile, grid on md+ */}
        <div
          className={cn(
            listings.length >= 3
              ? "flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:gap-x-6 md:gap-y-10 md:overflow-visible md:pb-0"
              : listings.length === 2
                ? "grid grid-cols-2 gap-x-6 gap-y-10"
                : "grid grid-cols-1 sm:max-w-xs",
          )}
        >
          {listings.map((listing) => (
            <ItemCard
              key={listing.id}
              listing={listing}
              className={
                listings.length >= 3
                  ? "w-[72vw] shrink-0 snap-start md:w-auto"
                  : undefined
              }
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}
