import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ConfirmPurchaseForm } from "@/components/checkout/confirm-purchase-form";
import { VerificationBadge } from "@/components/brand/verification-badge";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAuth } from "@/lib/auth/guards";
import { formatUgx } from "@/lib/format/currency";
import {
  getCheckoutPreview,
  OrderServiceError,
} from "@/lib/services/orders";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ listingId: string }>;
};

function LineItem({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={
          emphasis
            ? "font-heading text-lg text-foreground"
            : "text-sm text-foreground"
        }
      >
        {value}
      </span>
    </div>
  );
}

export default async function CheckoutPage({ params }: PageProps) {
  const session = await requireAuth();
  const { listingId } = await params;

  let preview;

  try {
    preview = await getCheckoutPreview(listingId, session.user.id);
  } catch (error) {
    if (error instanceof OrderServiceError) {
      redirect(`/vault/${listingId}?checkout=unavailable`);
    }
    throw error;
  }

  if (!preview) {
    notFound();
  }

  const { listing, seller, shipping, totals, commissionSettingLabel } = preview;

  return (
    <>
      <div className="border-b border-border py-6">
        <Container>
          <Link
            href={`/vault/${listing.id}`}
            className="text-xs uppercase tracking-[0.16em] text-muted-foreground transition-vault hover:text-foreground"
          >
            ← Back to the piece
          </Link>
        </Container>
      </div>

      <Section spacing="default" className="pt-10">
        <Container>
          <div className="mx-auto max-w-2xl">
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Checkout
            </p>
            <h1 className="mt-2 font-heading text-3xl leading-tight">
              Review your purchase
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Every amount below is calculated on our servers. Your total cannot
              be altered from the browser.
            </p>

            <Card className="mt-10">
              <CardHeader>
                <CardTitle>{listing.title}</CardTitle>
                <CardDescription>{listing.categoryName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {listing.imageUrl && (
                  <div className="aspect-[4/5] max-w-xs overflow-hidden border border-border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={listing.imageUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                  </div>
                )}

                <div className="border-t border-border pt-4">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Offered by
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="font-heading text-lg">
                      {seller.name ?? "Seller"}
                    </span>
                    {seller.isVerifiedPublicFigure && (
                      <VerificationBadge label="Verified public figure" />
                    )}
                  </div>
                </div>

                <div className="divide-y divide-border border border-border px-4">
                  <LineItem label="Item price" value={formatUgx(totals.itemPrice)} />
                  <LineItem
                    label={`Platform commission (${commissionSettingLabel})`}
                    value={formatUgx(totals.commissionAmount)}
                  />
                  <LineItem
                    label="Shipping"
                    value={
                      totals.shippingFee > 0
                        ? formatUgx(totals.shippingFee)
                        : "Included"
                    }
                  />
                  <LineItem
                    label="Total due"
                    value={formatUgx(totals.buyerTotal)}
                    emphasis
                  />
                </div>

                {shipping.regions.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Ships to: {shipping.regions.join(", ")}
                    {shipping.estimatedDaysMin != null &&
                      shipping.estimatedDaysMax != null &&
                      ` · ${shipping.estimatedDaysMin}–${shipping.estimatedDaysMax} days estimated`}
                  </p>
                )}

                <ConfirmPurchaseForm listingId={listing.id} />
              </CardContent>
            </Card>

            <div className="mt-6">
              <Button variant="outline" render={<Link href={`/vault/${listing.id}`} />}>
                Return to listing
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
