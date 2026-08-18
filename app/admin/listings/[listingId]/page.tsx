import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ListingActionPanel } from "@/components/admin/listing-action-panel";
import { Badge } from "@/components/ui/badge";
import { ListingStatus } from "@/lib/generated/prisma/enums";
import { getAdminListingDetail } from "@/lib/services/admin/listings";
import {
  LISTING_CONDITION_LABELS,
  LISTING_DOCUMENT_TYPE_LABELS,
} from "@/lib/schemas/listing";

type PageProps = {
  params: Promise<{ listingId: string }>;
};

function formatDate(date: Date | null | undefined) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

const STATUS_LABEL: Partial<Record<ListingStatus, string>> = {
  [ListingStatus.SUBMITTED]: "Submitted",
  [ListingStatus.UNDER_REVIEW]: "Under review",
  [ListingStatus.APPROVED]: "Approved",
  [ListingStatus.REJECTED]: "Rejected",
  [ListingStatus.PUBLISHED]: "Published",
  [ListingStatus.SUSPENDED]: "Suspended",
  [ListingStatus.DRAFT]: "Draft",
  [ListingStatus.ARCHIVED]: "Archived",
  [ListingStatus.SOLD]: "Sold",
};

const STATUS_VARIANT: Partial<
  Record<ListingStatus, "default" | "secondary" | "outline" | "destructive">
> = {
  [ListingStatus.APPROVED]: "default",
  [ListingStatus.PUBLISHED]: "default",
  [ListingStatus.SUBMITTED]: "secondary",
  [ListingStatus.UNDER_REVIEW]: "secondary",
  [ListingStatus.REJECTED]: "destructive",
  [ListingStatus.SUSPENDED]: "destructive",
  [ListingStatus.DRAFT]: "outline",
  [ListingStatus.ARCHIVED]: "outline",
};

function Field({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-sm text-zinc-800 dark:text-zinc-200">{value}</p>
    </div>
  );
}

export default async function AdminListingDetailPage({ params }: PageProps) {
  const { listingId } = await params;
  const listing = await getAdminListingDetail(listingId);

  if (!listing) {
    notFound();
  }

  const statusLabel = STATUS_LABEL[listing.status] ?? listing.status;
  const statusVariant = STATUS_VARIANT[listing.status] ?? "outline";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/listings"
            className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            ← Back to queue
          </Link>
          <h2 className="mt-2 text-2xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
            {listing.title}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
            <Badge variant={statusVariant}>{statusLabel}</Badge>
            <span>Submitted {formatDate(listing.submittedAt)}</span>
            <span>·</span>
            <span>
              Seller:{" "}
              <span className="text-zinc-800 dark:text-zinc-200">
                {listing.seller.name ?? listing.seller.email}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Left: listing detail */}
        <div className="space-y-8">
          {/* Images */}
          {listing.images.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
                Photographs ({listing.images.length})
              </p>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {listing.images.map((img, i) => (
                  <a
                    key={img.id}
                    href={img.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative aspect-square overflow-hidden rounded-sm bg-zinc-100 dark:bg-zinc-800"
                  >
                    <Image
                      src={img.url}
                      alt={img.altText ?? `Photo ${i + 1}`}
                      fill
                      sizes="160px"
                      className="object-cover transition-opacity group-hover:opacity-80"
                    />
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 rounded-sm bg-black/60 px-1 py-0.5 text-[9px] text-white">
                        Cover
                      </span>
                    )}
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-zinc-500 italic">No photographs uploaded.</p>
          )}

          {/* Item fields */}
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
              The piece
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category" value={listing.category?.name} />
              <Field label="Price" value={formatPrice(listing.price)} />
              <Field label="Brand" value={listing.brand} />
              <Field label="Designer" value={listing.designer} />
              <Field label="Size" value={listing.size} />
              <Field label="Colour" value={listing.color} />
              <Field label="Material" value={listing.material} />
              <Field
                label="Condition"
                value={
                  listing.condition
                    ? LISTING_CONDITION_LABELS[listing.condition]
                    : undefined
                }
              />
            </div>
          </div>

          {/* Provenance */}
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
              Provenance
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Worn by"
                value={
                  listing.wornBySeller
                    ? `${listing.seller.name ?? listing.seller.email} (seller)`
                    : listing.wornByName
                }
              />
              <Field label="Occasion" value={listing.wornWhere} />
              <Field label="Event" value={listing.eventName} />
              <Field label="Event date" value={listing.eventDate ? formatDate(listing.eventDate) : undefined} />
              <Field
                label="Times worn"
                value={listing.timesWorn ?? undefined}
              />
            </div>
          </div>

          {/* Story */}
          {listing.storyDetails ? (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
                Story{" "}
                {listing.storyVerifiedByVault ? (
                  <span className="text-green-600">· Vault verified</span>
                ) : (
                  <span className="text-zinc-400">· Seller claimed</span>
                )}
              </p>
              <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                {listing.storyDetails}
              </p>
            </div>
          ) : null}

          {/* Authenticity */}
          {listing.authenticityNotes ? (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
                Authenticity notes{" "}
                {listing.authenticityVerifiedByVault ? (
                  <span className="text-green-600">· Vault verified</span>
                ) : (
                  <span className="text-zinc-400">· Seller stated</span>
                )}
              </p>
              <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                {listing.authenticityNotes}
              </p>
            </div>
          ) : null}

          {/* Documents */}
          {listing.documents.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
                Supporting documents ({listing.documents.length})
              </p>
              <ul className="divide-y divide-zinc-100 rounded-sm border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
                {listing.documents.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center justify-between gap-3 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm text-zinc-800 dark:text-zinc-200">
                        {doc.fileName ?? "Document"}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {LISTING_DOCUMENT_TYPE_LABELS[doc.type]}
                      </p>
                    </div>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-xs text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline dark:hover:text-zinc-100"
                    >
                      View
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Status history */}
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
              Status history
            </p>
            {listing.statusHistory.length === 0 ? (
              <p className="text-sm text-zinc-400 italic">No history recorded.</p>
            ) : (
              <ol className="space-y-2">
                {listing.statusHistory.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-start gap-3 text-sm"
                  >
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-600 mt-1.5" />
                    <div className="min-w-0">
                      <p className="text-zinc-800 dark:text-zinc-200">
                        {entry.fromStatus ? (
                          <>
                            <span className="font-medium">{entry.fromStatus}</span>{" "}
                            →{" "}
                          </>
                        ) : null}
                        <span className="font-medium">{entry.toStatus}</span>
                        {entry.actor ? (
                          <span className="text-zinc-500">
                            {" "}
                            by {entry.actor.name ?? entry.actor.email}
                          </span>
                        ) : null}
                      </p>
                      {entry.reason ? (
                        <p className="mt-0.5 text-xs text-zinc-500">
                          {entry.reason}
                        </p>
                      ) : null}
                      {entry.notes ? (
                        <p className="mt-0.5 text-xs text-zinc-500 italic">
                          {entry.notes}
                        </p>
                      ) : null}
                      <p className="mt-0.5 text-xs text-zinc-400">
                        {formatDate(entry.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* Rejection reason (if currently rejected) */}
          {listing.status === ListingStatus.REJECTED && listing.rejectionReason ? (
            <div className="rounded-sm border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-red-600">
                Rejection reason
              </p>
              <p className="mt-1 text-sm text-red-800 dark:text-red-300">
                {listing.rejectionReason}
              </p>
            </div>
          ) : null}
        </div>

        {/* Right: sidebar */}
        <div className="space-y-6">
          {/* Action panel */}
          <ListingActionPanel
            listingId={listing.id}
            currentStatus={listing.status}
            currentAdminNotes={listing.adminNotes}
          />

          {/* Seller info */}
          <div className="space-y-3 rounded-sm border border-zinc-200 p-5 dark:border-zinc-800">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
              Seller
            </p>
            <div className="space-y-1 text-sm">
              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                {listing.seller.name ?? "—"}
              </p>
              <p className="text-zinc-500">{listing.seller.email}</p>
              {listing.seller.isVerifiedPublicFigure ? (
                <span className="inline-block rounded-sm border border-border px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Verified figure
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
