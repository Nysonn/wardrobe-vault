import Link from "next/link";

import { EmptyState } from "@/components/brand/empty-state";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { requireAuth } from "@/lib/auth/guards";
import { formatUgx } from "@/lib/format/currency";
import { PayoutStatus } from "@/lib/generated/prisma/enums";
import { getSellerWalletOverview } from "@/lib/services/payouts";

export const dynamic = "force-dynamic";

const PAYOUT_STATUS_LABELS: Record<PayoutStatus, string> = {
  [PayoutStatus.PENDING]: "Pending",
  [PayoutStatus.APPROVED]: "Approved",
  [PayoutStatus.PROCESSING]: "Processing",
  [PayoutStatus.PAID]: "Paid",
  [PayoutStatus.FAILED]: "Failed",
  [PayoutStatus.ON_HOLD]: "On hold",
};

export default async function WalletPage() {
  const session = await requireAuth();
  const { wallet, payouts, transactions } = await getSellerWalletOverview(
    session.user.id,
  );

  return (
    <Section spacing="default" className="pt-10">
      <Container>
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          My Vault
        </p>
        <h1 className="mt-2 font-heading text-3xl">Earnings</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Sale amounts, commissions, and payout status for each piece sold
          through the Vault.
        </p>

        <dl className="mt-10 grid gap-4 sm:grid-cols-2 max-w-xl">
          <div className="border border-border px-4 py-5">
            <dt className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Available balance
            </dt>
            <dd className="mt-2 font-heading text-2xl">
              {formatUgx(wallet.availableBalance)}
            </dd>
          </div>
          <div className="border border-border px-4 py-5">
            <dt className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Pending payout
            </dt>
            <dd className="mt-2 font-heading text-2xl">
              {formatUgx(wallet.pendingBalance)}
            </dd>
          </div>
        </dl>

        {payouts.length === 0 ? (
          <EmptyState
            className="mt-12"
            title="No sales yet"
            description="When a piece sells, the full financial breakdown will appear here — sale amount, commission, net earnings, and payout status."
            action={
              <Link
                href="/sell/new"
                className="text-sm uppercase tracking-[0.14em] text-foreground underline-offset-4 hover:underline"
              >
                List a piece
              </Link>
            }
          />
        ) : (
          <div className="mt-12 space-y-8">
            <section>
              <h2 className="font-heading text-xl">Sales & payouts</h2>
              <ul className="mt-4 divide-y divide-border border border-border">
                {payouts.map((payout) => {
                  const item = payout.order.items[0];
                  const imageUrl = item?.listing.images[0]?.url;

                  return (
                    <li key={payout.id} className="px-4 py-5">
                      <div className="flex flex-wrap gap-4 sm:flex-nowrap">
                        {imageUrl ? (
                          <div className="size-16 shrink-0 overflow-hidden border border-border bg-muted">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imageUrl}
                              alt=""
                              className="size-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="size-16 shrink-0 border border-border bg-muted" />
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p className="font-heading text-lg">
                                {item?.titleSnapshot ?? "Sale"}
                              </p>
                              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                                {payout.order.orderNumber}
                              </p>
                            </div>
                            <Badge variant="secondary">
                              {PAYOUT_STATUS_LABELS[payout.status]}
                            </Badge>
                          </div>

                          <dl className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                              <dt className="text-xs text-muted-foreground">
                                Sale amount
                              </dt>
                              <dd className="text-sm">
                                {formatUgx(payout.grossAmount)}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs text-muted-foreground">
                                Commission
                              </dt>
                              <dd className="text-sm">
                                {formatUgx(payout.commissionAmount)}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs text-muted-foreground">
                                Net earnings
                              </dt>
                              <dd className="text-sm font-medium">
                                {formatUgx(payout.netAmount)}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs text-muted-foreground">
                                Buyer total
                              </dt>
                              <dd className="text-sm">
                                {formatUgx(payout.order.totalAmount)}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            {transactions.length > 0 && (
              <section>
                <h2 className="font-heading text-xl">Recent ledger activity</h2>
                <ul className="mt-4 divide-y divide-border border border-border text-sm">
                  {transactions.map((tx) => (
                    <li
                      key={tx.id}
                      className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3"
                    >
                      <span className="text-muted-foreground">
                        {tx.description ?? tx.type.replace("_", " ")}
                      </span>
                      <span className="font-mono text-xs">
                        {formatUgx(tx.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </Container>
    </Section>
  );
}
