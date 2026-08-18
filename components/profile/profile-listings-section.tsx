import { EmptyState } from "@/components/brand/empty-state";
import { ItemCard } from "@/components/listings/item-card";
import type { PublicListingCard } from "@/lib/services/listings/public";
import { cn } from "@/lib/utils";

type ProfileListingsSectionProps = {
  label: string;
  title: string;
  listings: PublicListingCard[];
  emptyTitle: string;
  emptyDescription: string;
  className?: string;
};

export function ProfileListingsSection({
  label,
  title,
  listings,
  emptyTitle,
  emptyDescription,
  className,
}: ProfileListingsSectionProps) {
  return (
    <section className={cn("space-y-8", className)}>
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          {label}
        </p>
        <h2 className="mt-1 font-heading text-2xl sm:text-3xl">{title}</h2>
      </div>

      {listings.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div
          className={cn(
            "grid gap-x-6 gap-y-10",
            listings.length >= 3
              ? "grid-cols-2 sm:grid-cols-3"
              : listings.length === 2
                ? "grid-cols-2"
                : "grid-cols-1 sm:max-w-xs",
          )}
        >
          {listings.map((listing) => (
            <ItemCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </section>
  );
}
