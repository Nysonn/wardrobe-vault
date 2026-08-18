import Image from "next/image";
import Link from "next/link";

import { VerificationBadge } from "@/components/brand/verification-badge";
import { cn } from "@/lib/utils";

type ProfileSummary = {
  headline: string | null;
  region: string | null;
  location: string | null;
  photoUrl: string | null;
} | null;

type WornByBlockProps = {
  wornByName: string | null;
  wornBySeller: boolean;
  sellerName: string | null;
  wornBy: {
    id: string;
    name: string | null;
    isVerifiedPublicFigure: boolean;
    profile: ProfileSummary;
  } | null;
  className?: string;
};

/**
 * "Worn By" editorial block (initial-prompt §12).
 * Links to public profile when a verified figure is linked in the database.
 */
export function WornByBlock({
  wornByName,
  wornBySeller,
  sellerName,
  wornBy,
  className,
}: WornByBlockProps) {
  const displayName =
    wornBy?.name ??
    (wornBySeller ? sellerName : wornByName) ??
    null;

  if (!displayName) return null;

  const isVerifiedFigure = wornBy?.isVerifiedPublicFigure ?? false;
  const profileHeadline = wornBy?.profile?.headline;
  const profileRegion =
    wornBy?.profile?.region ?? wornBy?.profile?.location ?? null;
  const profileHref = wornBy ? `/profile/${wornBy.id}` : null;
  const photoUrl = wornBy?.profile?.photoUrl;

  const content = (
    <>
      <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
        Worn by
      </p>

      <div className="mt-4 flex items-start gap-4">
        {photoUrl ? (
          <div className="relative size-16 shrink-0 overflow-hidden bg-muted">
            <Image
              src={photoUrl}
              alt=""
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <p className="font-heading text-2xl leading-tight text-foreground">
            {displayName}
          </p>

          {isVerifiedFigure && (
            <div className="mt-2">
              <VerificationBadge label="Verified public figure" />
            </div>
          )}

          {profileHeadline && (
            <p className="mt-2 text-sm text-muted-foreground">{profileHeadline}</p>
          )}

          {profileRegion && (
            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
              {profileRegion}
            </p>
          )}

          {profileHref && (
            <p className="mt-3 text-xs uppercase tracking-[0.16em] text-vault-accent underline-offset-4 group-hover:underline">
              View their Vault
            </p>
          )}
        </div>
      </div>
    </>
  );

  if (profileHref) {
    return (
      <Link
        href={profileHref}
        className={cn(
          "group block border border-border bg-muted/40 p-6 transition-vault hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      className={cn(
        "border border-border bg-muted/40 p-6",
        className,
      )}
    >
      {content}
      {!isVerifiedFigure && (
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Provenance details are seller-provided and have not been independently
          verified by Wardrobe Vault.
        </p>
      )}
    </div>
  );
}
