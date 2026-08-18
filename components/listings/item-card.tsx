import Image from "next/image";
import Link from "next/link";

import { VerificationBadge } from "@/components/brand/verification-badge";
import { cn } from "@/lib/utils";
import type { PublicListingCard } from "@/lib/services/listings/public";

type ItemCardProps = {
  listing: PublicListingCard;
  className?: string;
};

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Editorial item card (master prompt §10).
 * Not generic e-commerce — quiet-luxury, typographic, provenance-forward.
 */
export function ItemCard({ listing, className }: ItemCardProps) {
  const cover = listing.images[0];
  const wornByLabel =
    listing.wornBy?.name ?? listing.wornByName ?? null;
  const isVaultVerified =
    listing.storyVerifiedByVault || listing.authenticityVerifiedByVault;

  return (
    <Link
      href={`/vault/${listing.id}`}
      className={cn(
        "group flex flex-col gap-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
        {cover ? (
          <Image
            src={cover.url}
            alt={cover.altText ?? listing.title}
            fill
            sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-xs tracking-[0.18em] uppercase text-muted-foreground">
              No image
            </span>
          </div>
        )}

        {/* Vault-verified ribbon — top-left, not a big badge */}
        {isVaultVerified && (
          <div className="absolute left-0 top-0 bg-background/90 px-2.5 py-1">
            <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-vault-accent">
              Vault Verified
            </span>
          </div>
        )}
      </div>

      {/* Text block */}
      <div className="mt-3 flex flex-col gap-1 px-0.5">
        {/* Worn By line — shown before title, per §10 */}
        {wornByLabel && (
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <span>Worn by</span>
            <span className="text-foreground">{wornByLabel}</span>
            {listing.wornBy?.isVerifiedPublicFigure && (
              <VerificationBadge className="py-0" />
            )}
          </p>
        )}

        {/* Title */}
        <h3 className="font-heading text-base leading-snug text-foreground group-hover:underline group-hover:underline-offset-2">
          {listing.title}
        </h3>

        {/* Brand / Designer */}
        {(listing.brand || listing.designer) && (
          <p className="text-xs text-muted-foreground">
            {listing.designer ?? listing.brand}
          </p>
        )}

        {/* Event context */}
        {listing.eventName && (
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {listing.eventName}
          </p>
        )}

        {/* Price + seller */}
        <div className="mt-1 flex items-baseline justify-between gap-2">
          <span className="font-heading text-sm text-foreground">
            {formatPrice(listing.price, listing.currency)}
          </span>
          {listing.seller.name && (
            <span className="truncate text-[10px] text-muted-foreground">
              by {listing.seller.name}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
