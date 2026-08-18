import Link from "next/link";
import { notFound } from "next/navigation";

import { PayoutActionPanel } from "@/components/admin/payout-action-panel";
import { Badge } from "@/components/ui/badge";
import { formatUgx } from "@/lib/format/currency";
import { PayoutStatus } from "@/lib/generated/prisma/enums";
import { bpsToPercentLabel } from "@/lib/schemas/commission";
import { getAdminPayoutDetail } from "@/lib/services/admin/payouts";
import { getAvailablePayoutActions } from "@/lib/services/payouts";

type PageProps = {
  params: Promise<{ payoutId: string }>;
};

const STATUS_LABELS: Record<PayoutStatus, string> = {
  [PayoutStatus.PENDING]: "Pending",
  [PayoutStatus.APPROVED]: "Approved",
  [PayoutStatus.PROCESSING]: "Processing",
  [PayoutStatus.PAID]: "Paid",
  [PayoutStatus.FAILED]: "Failed",
  [PayoutStatus.ON_HOLD]: "On hold",
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-zinc-200 py-3 text-sm dark:border-zinc-800">
      <span className="text-zinc-500">{label}</span>
      <span className="text-zinc-900 dark:text-zinc-100">{value}</span>
    </div>
  );
}

export default async function AdminPayoutDetailPage({ params }: PageProps) {
  const { payoutId } = await params;
  const payout = await getAdminPayoutDetail(payoutId);

  if (!payout) {
    notFound();
  }

  const item = payout.order.items[0];
  const availableActions = getAvailablePayoutActions(payout.status);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/payouts"
          className="text-xs uppercase tracking-wide text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          ← Back to payouts
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
              {item?.titleSnapshot ?? "Payout review"}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {payout.order.orderNumber} ·{" "}
              {payout.seller.name ?? payout.seller.email}
            </p>
          </div>
          <Badge variant="secondary">{STATUS_LABELS[payout.status]}</Badge>
        </div>
      </div>

      <section className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="border border-zinc-200 p-5 dark:border-zinc-800">
            <h3 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
              Financial breakdown
            </h3>
            <div className="mt-4">
              <DetailRow
                label="Item price"
                value={formatUgx(payout.order.itemPrice)}
              />
              <DetailRow
                label={`Platform commission (${bpsToPercentLabel(payout.order.commissionRateBps)})`}
                value={formatUgx(payout.order.commissionAmount)}
              />
              <DetailRow
                label="Shipping (buyer paid)"
                value={formatUgx(payout.order.shippingFee)}
              />
              <DetailRow
                label="Buyer total"
                value={formatUgx(payout.order.totalAmount)}
              />
              <DetailRow
                label="Seller earnings"
                value={formatUgx(payout.netAmount)}
              />
              <DetailRow
                label="Platform revenue"
                value={formatUgx(payout.commissionAmount)}
              />
            </div>
          </div>

          {payout.notes && (
            <div className="border border-zinc-200 p-5 dark:border-zinc-800">
              <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Internal notes
              </h3>
              <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">
                {payout.notes}
              </p>
            </div>
          )}
        </div>

        <aside className="border border-zinc-200 p-5 dark:border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Payout actions
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-zinc-500">
            Only administrators can advance payout status. Completing a payout
            moves funds from pending to available in the seller wallet.
          </p>
          <div className="mt-4">
            <PayoutActionPanel
              payoutId={payout.id}
              availableActions={availableActions}
            />
          </div>
        </aside>
      </section>
    </div>
  );
}
