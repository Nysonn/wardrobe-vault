import Link from "next/link";

import { EmptyState } from "@/components/brand/empty-state";
import { Badge } from "@/components/ui/badge";
import { REPORT_REASON_LABELS } from "@/lib/schemas/report";
import {
  getAdminReportQueue,
  getAdminReportQueueCounts,
  type AdminReportTab,
} from "@/lib/services/admin/reports";

const TABS: { id: AdminReportTab; label: string }[] = [
  { id: "open", label: "Open" },
  { id: "under-review", label: "Under review" },
  { id: "resolved", label: "Closed" },
  { id: "all", label: "All" },
];

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

type SearchParams = Promise<{ tab?: string }>;

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const validTabs: AdminReportTab[] = [
    "open",
    "under-review",
    "resolved",
    "all",
  ];
  const activeTab: AdminReportTab = validTabs.includes(
    params.tab as AdminReportTab,
  )
    ? (params.tab as AdminReportTab)
    : "open";

  const [reports, counts] = await Promise.all([
    getAdminReportQueue(activeTab),
    getAdminReportQueueCounts(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
          Reports & disputes
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Review listing reports from buyers and sellers.
        </p>
      </div>

      <nav className="-mx-4 flex gap-1 overflow-x-auto border-b border-zinc-200 px-4 pb-px dark:border-zinc-800 sm:mx-0 sm:px-0">
        {TABS.map((tab) => {
          const count =
            tab.id !== "all" && tab.id !== "resolved"
              ? (counts[tab.id as Exclude<AdminReportTab, "all" | "resolved">] ??
                0)
              : undefined;
          const isActive = activeTab === tab.id;

          return (
            <Link
              key={tab.id}
              href={`/admin/reports?tab=${tab.id}`}
              className={[
                "inline-flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "border-b-2 border-zinc-900 font-medium text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100",
              ].join(" ")}
            >
              {tab.label}
              {count !== undefined && count > 0 ? (
                <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {reports.length === 0 ? (
        <EmptyState
          title="This queue is clear."
          description="No reports awaiting review in this view."
        />
      ) : (
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {reports.map((report) => (
            <li key={report.id}>
              <Link
                href={`/admin/reports/${report.id}`}
                className="-mx-2 flex items-center justify-between gap-4 rounded-sm px-2 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {report.listing.title}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {REPORT_REASON_LABELS[report.reason]} · reported by{" "}
                    {report.reporter.name ?? report.reporter.email}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <Badge variant="secondary">{report.status}</Badge>
                  <p className="mt-1 text-xs text-zinc-400">
                    {formatDate(report.createdAt)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
