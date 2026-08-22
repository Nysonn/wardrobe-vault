import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { VerificationBadge } from "@/components/brand/verification-badge";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ListingGallery } from "@/components/listings/listing-gallery";
import { ListingPurchaseBar } from "@/components/listings/listing-purchase-bar";
import { ReportListingDialog } from "@/components/listings/report-listing-dialog";
import { WishlistButton } from "@/components/listings/wishlist-button";
import { WornByBlock } from "@/components/listings/worn-by-block";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/guards";
import { formatUgx } from "@/lib/format/currency";
import { ListingDocumentType, ListingStatus } from "@/lib/generated/prisma/enums";
import {
  LISTING_CONDITION_LABELS,
  LISTING_DOCUMENT_TYPE_LABELS,
} from "@/lib/schemas/listing";
import { getPublicListingDetail } from "@/lib/services/listings/detail";
import { isListingFavorited } from "@/lib/services/wishlist";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ listingId: string }>;
};

function formatDate(date: Date | null | undefined) {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm text-foreground">{value}</p>
    </div>
  );
}

function TrustLabel({
  verified,
  verifiedLabel,
  unverifiedLabel,
}: {
  verified: boolean;
  verifiedLabel: string;
  unverifiedLabel: string;
}) {
  return (
    <span
      className={
        verified
          ? "text-[10px] font-medium uppercase tracking-[0.16em] text-vault-accent"
          : "text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground"
      }
    >
      {verified ? verifiedLabel : unverifiedLabel}
    </span>
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { listingId } = await params;
  const listing = await getPublicListingDetail(listingId);

  if (!listing) {
    return { title: "Listing not found — Wardrobe Vault" };
  }

  const wornBy =
    listing.wornBy?.name ??
    (listing.wornBySeller ? listing.seller.name : listing.wornByName);

  const descriptionParts = [
    listing.designer ?? listing.brand,
    wornBy ? `Worn by ${wornBy}` : null,
    listing.eventName,
  ].filter(Boolean);

  return {
    title: `${listing.title} — Wardrobe Vault`,
    description:
      descriptionParts.length > 0
        ? descriptionParts.join(" · ")
        : listing.storyDetails?.slice(0, 160),
  };
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { listingId } = await params;
  const [listing, session] = await Promise.all([
    getPublicListingDetail(listingId),
    getSession(),
  ]);

  if (!listing) {
    notFound();
  }

  const isSold = listing.status === ListingStatus.SOLD;
  const isPublished = listing.status === ListingStatus.PUBLISHED;
  const isOwnListing = session?.user?.id === listing.seller.id;
  const isFavorited =
    session?.user?.id && !isOwnListing && isPublished
      ? await isListingFavorited(session.user.id, listingId)
      : false;
  const checkoutHref = `/checkout/${listing.id}`;
  const loginHref = `/login?callbackUrl=${encodeURIComponent(checkoutHref)}`;
  const purchaseDocuments = listing.documents.filter(
    (doc) => doc.type === ListingDocumentType.PROOF_OF_PURCHASE,
  );
  const hasPurchaseInfo = purchaseDocuments.length > 0;
  const yearWorn = listing.eventDate
    ? new Date(listing.eventDate).getFullYear()
    : null;
  const wornByLabel =
    listing.wornBy?.name ??
    (listing.wornBySeller ? listing.seller.name : listing.wornByName);

  return (
    <>
      {/* Breadcrumb + actions */}
      <div className="border-b border-border py-6">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/vault"
              className="text-xs uppercase tracking-[0.16em] text-muted-foreground transition-vault hover:text-foreground"
            >
              ← Back to the Vault
            </Link>
            <ReportListingDialog
              listingId={listing.id}
              listingTitle={listing.title}
              isAuthenticated={!!session?.user?.id}
            />
          </div>
        </Container>
      </div>

      <Section spacing="default" className="pb-24 pt-10 lg:pb-10">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
            {/* Gallery */}
            <ListingGallery
              images={listing.images}
              title={listing.title}
              className="animate-fade-in"
            />

            {/* Summary column */}
            <div className="flex flex-col gap-8 animate-fade-in-slow">
              <div>
                {isSold && (
                  <Badge variant="secondary" className="mb-3">
                    Sold
                  </Badge>
                )}

                {wornByLabel && (
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Worn by{" "}
                    <span className="text-foreground">{wornByLabel}</span>
                    {listing.wornBy?.isVerifiedPublicFigure && (
                      <span className="ml-2 inline-flex align-middle">
                        <VerificationBadge className="py-0" />
                      </span>
                    )}
                  </p>
                )}

                <h1 className="mt-3 font-heading text-3xl leading-tight sm:text-4xl">
                  {listing.title}
                </h1>

                {(listing.designer || listing.brand) && (
                  <p className="mt-2 text-base text-muted-foreground">
                    {listing.designer ?? listing.brand}
                  </p>
                )}

                {listing.eventName && (
                  <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {listing.eventName}
                  </p>
                )}

                <p className="mt-6 font-heading text-2xl text-foreground">
                  {formatUgx(listing.price)}
                </p>

                {isPublished && !isOwnListing && (
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    {session?.user?.id ? (
                      <>
                        <Button size="lg" render={<Link href={checkoutHref} />}>
                          Purchase
                        </Button>
                        <WishlistButton
                          listingId={listing.id}
                          initialFavorited={isFavorited}
                        />
                      </>
                    ) : (
                      <Button size="lg" render={<Link href={loginHref} />}>
                        Sign in to purchase
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Item details */}
              <div className="space-y-4 border-t border-border pt-6">
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  The piece
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <DetailField label="Category" value={listing.category.name} />
                  <DetailField
                    label="Condition"
                    value={
                      listing.condition
                        ? LISTING_CONDITION_LABELS[listing.condition]
                        : null
                    }
                  />
                  <DetailField label="Size" value={listing.size} />
                  <DetailField label="Material" value={listing.material} />
                  <DetailField label="Colour" value={listing.color} />
                  <DetailField label="Year" value={yearWorn} />
                  <DetailField
                    label="Original purchase"
                    value={
                      hasPurchaseInfo
                        ? `${purchaseDocuments.length} proof-of-purchase document${purchaseDocuments.length === 1 ? "" : "s"} on file (seller provided)`
                        : null
                    }
                  />
                  <DetailField label="Event" value={listing.eventName} />
                  <DetailField
                    label="Date worn"
                    value={formatDate(listing.eventDate)}
                  />
                  <DetailField
                    label="Times worn"
                    value={
                      listing.timesWorn !== null && listing.timesWorn !== undefined
                        ? String(listing.timesWorn)
                        : null
                    }
                  />
                  <DetailField label="Occasion" value={listing.wornWhere} />
                </div>
              </div>

              {/* Seller */}
              <div className="space-y-3 border-t border-border pt-6">
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Offered by
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/profile/${listing.seller.id}`}
                    className="font-heading text-lg text-foreground underline-offset-4 hover:underline"
                  >
                    {listing.seller.name ?? "Seller"}
                  </Link>
                  {listing.seller.isVerifiedPublicFigure && (
                    <VerificationBadge label="Verified public figure" />
                  )}
                </div>
                {(listing.seller.profile?.region ||
                  listing.seller.profile?.location) && (
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    {listing.seller.profile.region ??
                      listing.seller.profile.location}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Worn By block — full width below gallery on smaller screens, editorial treatment */}
          {(wornByLabel || listing.wornBy) && (
            <div className="mt-14">
              <WornByBlock
                wornByName={listing.wornByName}
                wornBySeller={listing.wornBySeller}
                sellerName={listing.seller.name}
                wornBy={listing.wornBy}
              />
            </div>
          )}

          {/* Story */}
          {listing.storyDetails && (
            <article className="mt-14 max-w-3xl border-t border-border pt-10">
              <div className="flex flex-wrap items-baseline gap-3">
                <h2 className="font-heading text-2xl">The story</h2>
                <TrustLabel
                  verified={listing.storyVerifiedByVault}
                  verifiedLabel="Verified story"
                  unverifiedLabel="Seller claimed — not independently verified"
                />
              </div>
              <p className="mt-6 whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
                {listing.storyDetails}
              </p>
              {!listing.storyVerifiedByVault && (
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  This narrative was provided by the seller. Wardrobe Vault has
                  not independently confirmed celebrity ownership or usage unless
                  marked as verified above.
                </p>
              )}
            </article>
          )}

          {/* Authenticity */}
          <section className="mt-14 max-w-3xl border-t border-border pt-10">
            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="font-heading text-2xl">Authenticity</h2>
              <TrustLabel
                verified={listing.authenticityVerifiedByVault}
                verifiedLabel="Vault verified"
                unverifiedLabel="Seller claimed"
              />
            </div>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Wardrobe Vault distinguishes between information provided by the
              seller and details our team has reviewed. A listing is never
              labelled authentic solely because it was uploaded.
            </p>

            {listing.authenticityNotes && (
              <p className="mt-6 whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
                {listing.authenticityNotes}
              </p>
            )}

            {listing.documents.length > 0 && (
              <div className="mt-8">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Supporting evidence on file
                </p>
                <ul className="mt-3 divide-y divide-border border border-border">
                  {listing.documents.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                    >
                      <span>{LISTING_DOCUMENT_TYPE_LABELS[doc.type]}</span>
                      <span className="text-xs text-muted-foreground">
                        {listing.authenticityVerifiedByVault
                          ? "Reviewed by Vault"
                          : "Seller provided"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!listing.authenticityNotes && listing.documents.length === 0 && (
              <p className="mt-6 text-sm text-muted-foreground">
                No additional authenticity notes or documents were provided for
                this listing.
              </p>
            )}
          </section>

          {/* Shipping note if available */}
          {listing.shippingDetail?.isAvailable && (
            <section className="mt-14 max-w-3xl border-t border-border pt-10">
              <h2 className="font-heading text-2xl">Shipping</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <DetailField
                  label="Regions"
                  value={
                    listing.shippingDetail.regions.length > 0
                      ? listing.shippingDetail.regions.join(", ")
                      : "Available"
                  }
                />
                <DetailField
                  label="Shipping fee"
                  value={
                    listing.shippingDetail.fee > 0
                      ? formatUgx(listing.shippingDetail.fee)
                      : "Included or arranged separately"
                  }
                />
              </div>
              {listing.shippingDetail.notes && (
                <p className="mt-4 text-sm text-muted-foreground">
                  {listing.shippingDetail.notes}
                </p>
              )}
            </section>
          )}

          {/* Footer actions */}
          <div className="mt-14 flex flex-wrap items-center gap-4 border-t border-border pt-10">
            {isPublished && !isOwnListing && (
              session?.user?.id ? (
                <Button render={<Link href={checkoutHref} />}>
                  Purchase
                </Button>
              ) : (
                <Button render={<Link href={loginHref} />}>
                  Sign in to purchase
                </Button>
              )
            )}
            <Button variant="outline" render={<Link href="/vault" />}>
              Continue browsing
            </Button>
            <ReportListingDialog
              listingId={listing.id}
              listingTitle={listing.title}
              isAuthenticated={!!session?.user?.id}
            />
          </div>
        </Container>
      </Section>

      {isPublished && !isOwnListing && (
        <ListingPurchaseBar
          listingId={listing.id}
          price={listing.price}
          checkoutHref={checkoutHref}
          loginHref={loginHref}
          isAuthenticated={!!session?.user?.id}
          initialFavorited={isFavorited}
        />
      )}
    </>
  );
}
