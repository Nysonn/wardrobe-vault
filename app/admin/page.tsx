import Link from "next/link";

import { formatUgx } from "@/lib/format/currency";
import { getAdminListingQueueCounts } from "@/lib/services/admin/listings";
import { getAdminOverviewMetrics } from "@/lib/services/admin/overview";
import { getAdminReportQueueCounts } from "@/lib/services/admin/reports";
import { getAdminVerificationQueueCounts } from "@/lib/services/admin/verification";

type OverviewRowProps = {
  label: string;
  value: string | number;
  href: string;
  detail?: string;
};

function OverviewRow({ label, value, href, detail }: OverviewRowProps) {
  return (
    <Link
      href={href}
      className="group flex items-start justify-between gap-6 border-b border-zinc-200 px-5 py-4 transition-colors last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50"
    >
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">
          {label}
        </p>
        <p className="mt-1 font-heading text-2xl tracking-tight text-zinc-900 dark:text-zinc-100">
          {value}
        </p>
        {detail ? (
          <p className="mt-1 text-xs text-zinc-400">{detail}</p>
        ) : null}
      </div>
      <span className="shrink-0 pt-1 text-[10px] uppercase tracking-[0.14em] text-zinc-400 transition-colors group-hover:text-zinc-700 dark:group-hover:text-zinc-200">
        Open
      </span>
    </Link>
  );
}

export default async function AdminPage() {
  const [metrics, listingCounts, verificationCounts, reportCounts] =
    await Promise.all([
      getAdminOverviewMetrics(),
      getAdminListingQueueCounts(),
      getAdminVerificationQueueCounts(),
      getAdminReportQueueCounts(),
    ]);

  const pendingListings = listingCounts.pending ?? 0;

  return (
    <section className="space-y-10">
      <div>
        <h2 className="font-heading text-3xl tracking-tight text-zinc-900 dark:text-zinc-100">
          Overview
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          Platform activity and moderation queues — select a row to review.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h3 className="mb-3 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">
            Platform
          </h3>
          <div className="overflow-hidden rounded-sm border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <OverviewRow
              label="Members"
              value={metrics.totalUsers}
              href="/admin/users"
            />
            <OverviewRow
              label="Active listings"
              value={metrics.activeListings}
              href="/admin/listings?tab=all"
            />
            <OverviewRow
              label="Total orders"
              value={metrics.totalOrders}
              href="/admin/orders"
            />
            <OverviewRow
              label="Completed sales"
              value={metrics.totalSales}
              href="/admin/orders?tab=completed"
            />
            <OverviewRow
              label="Platform revenue"
              value={formatUgx(metrics.platformRevenue)}
              href="/admin/payouts"
              detail={`${formatUgx(metrics.grossSalesVolume)} gross volume`}
            />
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">
            Needs attention
          </h3>
          <div className="overflow-hidden rounded-sm border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <OverviewRow
              label="Pending approvals"
              value={pendingListings}
              href="/admin/listings?tab=pending"
              detail={`${listingCounts.submitted ?? 0} submitted · ${listingCounts["under-review"] ?? 0} in review`}
            />
            <OverviewRow
              label="Pending payouts"
              value={metrics.pendingPayouts}
              href="/admin/payouts?tab=pending"
            />
            <OverviewRow
              label="Open disputes"
              value={metrics.openDisputes}
              href="/admin/orders?tab=disputed"
            />
            <OverviewRow
              label="Open reports"
              value={metrics.openReports}
              href="/admin/reports?tab=open"
              detail={`${reportCounts["under-review"] ?? 0} under review`}
            />
            <OverviewRow
              label="Verification queue"
              value={verificationCounts.pending ?? 0}
              href="/admin/verification?tab=pending"
            />
          </div>
        </section>
      </div>
    </section>
  );
}
