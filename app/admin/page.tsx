import Link from "next/link";

import { getAdminListingQueueCounts } from "@/lib/services/admin/listings";
import { getAdminPayoutQueueCounts } from "@/lib/services/admin/payouts";

export default async function AdminPage() {
  const [counts, payoutCounts] = await Promise.all([
    getAdminListingQueueCounts(),
    getAdminPayoutQueueCounts(),
  ]);
  const totalPending =
    (counts.submitted ?? 0) + (counts["under-review"] ?? 0);
  const pendingPayouts = payoutCounts.pending ?? 0;

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
          Overview
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
          Welcome to Wardrobe Vault admin. Use the navigation to manage
          listings, verifications, and payouts.
        </p>
      </div>

      {/* Quick-action cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/listings?tab=submitted"
          className="rounded-sm border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
        >
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
            Listings awaiting review
          </p>
          <p className="mt-2 text-3xl font-light tracking-tight text-zinc-900 dark:text-zinc-100">
            {totalPending}
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            {counts.submitted ?? 0} submitted ·{" "}
            {counts["under-review"] ?? 0} under review
          </p>
        </Link>
        <Link
          href="/admin/listings?tab=approved"
          className="rounded-sm border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
        >
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
            Approved (awaiting publish)
          </p>
          <p className="mt-2 text-3xl font-light tracking-tight text-zinc-900 dark:text-zinc-100">
            {counts.approved ?? 0}
          </p>
          <p className="mt-1 text-xs text-zinc-400">Ready to publish</p>
        </Link>
        <Link
          href="/admin/payouts?tab=pending"
          className="rounded-sm border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
        >
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
            Payouts awaiting approval
          </p>
          <p className="mt-2 text-3xl font-light tracking-tight text-zinc-900 dark:text-zinc-100">
            {pendingPayouts}
          </p>
          <p className="mt-1 text-xs text-zinc-400">Seller earnings to review</p>
        </Link>
      </div>
    </section>
  );
}
