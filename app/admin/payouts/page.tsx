import Link from "next/link";

import { EmptyState } from "@/components/brand/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatUgx } from "@/lib/format/currency";
import { PayoutStatus } from "@/lib/generated/prisma/enums";
import {
  getAdminPayoutQueue,
  getAdminPayoutQueueCounts,
  type AdminPayoutTab,
} from "@/lib/services/admin/payouts";

const TABS: { id: AdminPayoutTab; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "processing", label: "Processing" },
  { id: "paid", label: "Paid" },
  { id: "failed", label: "Failed" },
  { id: "on-hold", label: "On hold" },
  { id: "all", label: "All" },
];

const STATUS_BADGE: Record<
  PayoutStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  [PayoutStatus.PENDING]: { label: "Pending", variant: "secondary" },
  [PayoutStatus.APPROVED]: { label: "Approved", variant: "default" },
  [PayoutStatus.PROCESSING]: { label: "Processing", variant: "secondary" },
  [PayoutStatus.PAID]: { label: "Paid", variant: "default" },
  [PayoutStatus.FAILED]: { label: "Failed", variant: "destructive" },
  [PayoutStatus.ON_HOLD]: { label: "On hold", variant: "outline" },
};

function formatDate(date: Date | null | undefined) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

type SearchParams = Promise<{ tab?: string }>;

export default async function AdminPayoutsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const validTabs: AdminPayoutTab[] = [
    "pending",
    "approved",
    "processing",
    "paid",
    "failed",
    "on-hold",
    "all",
  ];
  const activeTab: AdminPayoutTab = validTabs.includes(
    params.tab as AdminPayoutTab,
  )
    ? (params.tab as AdminPayoutTab)
    : "pending";

  const [payouts, counts] = await Promise.all([
    getAdminPayoutQueue(activeTab),
    getAdminPayoutQueueCounts(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
          Payouts
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
          Review seller earnings and advance payouts through approval and
          processing. Sellers cannot change payout status themselves.
        </p>
      </div>

      <nav className="flex flex-wrap gap-2 border-b border-zinc-200 pb-4 dark:border-zinc-800">
        {TABS.map((tab) => {
          const count =
            tab.id === "all"
              ? Object.values(counts).reduce((sum, n) => sum + n, 0)
              : counts[tab.id as Exclude<AdminPayoutTab, "all">];
          const isActive = activeTab === tab.id;

          return (
            <Link
              key={tab.id}
              href={`/admin/payouts?tab=${tab.id}`}
              className={
                isActive
                  ? "rounded-sm bg-zinc-900 px-3 py-1.5 text-xs uppercase tracking-wide text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "rounded-sm px-3 py-1.5 text-xs uppercase tracking-wide text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              }
            >
              {tab.label}
              {count !== undefined ? ` (${count})` : ""}
            </Link>
          );
        })}
      </nav>

      {payouts.length === 0 ? (
        <EmptyState
          title="No payouts in this queue"
          description="Payouts appear here after a buyer completes a purchase."
        />
      ) : (
        <ul className="divide-y divide-zinc-200 border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {payouts.map((payout) => {
            const badge = STATUS_BADGE[payout.status];
            const itemTitle =
              payout.order.items[0]?.titleSnapshot ?? "Order item";

            return (
              <li key={payout.id}>
                <Link
                  href={`/admin/payouts/${payout.id}`}
                  className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {itemTitle}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {payout.order.orderNumber} ·{" "}
                      {payout.seller.name ?? payout.seller.email} ·{" "}
                      {formatDate(payout.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {formatUgx(payout.netAmount)} net
                      </p>
                      <p className="text-xs text-zinc-500">
                        {formatUgx(payout.grossAmount)} gross ·{" "}
                        {formatUgx(payout.commissionAmount)} commission
                      </p>
                    </div>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
