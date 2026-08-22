import Link from "next/link";

import { EmptyState } from "@/components/brand/empty-state";
import { Badge } from "@/components/ui/badge";
import { VerificationStatus } from "@/lib/generated/prisma/enums";
import {
  getAdminVerificationQueue,
  getAdminVerificationQueueCounts,
  type AdminVerificationTab,
} from "@/lib/services/admin/verification";

const TABS: { id: AdminVerificationTab; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "verified", label: "Verified" },
  { id: "revoked", label: "Revoked" },
  { id: "all", label: "All" },
];

const STATUS_BADGE: Record<
  VerificationStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  [VerificationStatus.UNVERIFIED]: { label: "Unverified", variant: "outline" },
  [VerificationStatus.PENDING]: { label: "Pending", variant: "secondary" },
  [VerificationStatus.VERIFIED]: { label: "Verified", variant: "default" },
  [VerificationStatus.REVOKED]: { label: "Revoked", variant: "destructive" },
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

type SearchParams = Promise<{ tab?: string }>;

export default async function AdminVerificationPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const validTabs: AdminVerificationTab[] = [
    "pending",
    "verified",
    "revoked",
    "all",
  ];
  const activeTab: AdminVerificationTab = validTabs.includes(
    params.tab as AdminVerificationTab,
  )
    ? (params.tab as AdminVerificationTab)
    : "pending";

  const [applications, counts] = await Promise.all([
    getAdminVerificationQueue(activeTab),
    getAdminVerificationQueueCounts(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
          Public figure verification
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Review applications and evidence. Status is never granted automatically.
        </p>
      </div>

      <nav className="-mx-4 flex gap-1 overflow-x-auto border-b border-zinc-200 px-4 pb-px dark:border-zinc-800 sm:mx-0 sm:px-0">
        {TABS.map((tab) => {
          const count =
            tab.id !== "all" ? (counts[tab.id] ?? 0) : undefined;
          const isActive = activeTab === tab.id;

          return (
            <Link
              key={tab.id}
              href={`/admin/verification?tab=${tab.id}`}
              className={[
                "inline-flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "border-b-2 border-zinc-900 font-medium text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100",
              ].join(" ")}
              aria-current={isActive ? "page" : undefined}
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

      {applications.length === 0 ? (
        <EmptyState
          title="This queue is clear."
          description="No verification applications awaiting review."
        />
      ) : (
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {applications.map((application) => {
            const badge = STATUS_BADGE[application.status];

            return (
              <li key={application.id}>
                <Link
                  href={`/admin/verification/${application.id}`}
                  className="-mx-2 flex items-center gap-4 rounded-sm px-2 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {application.user.name ?? application.user.email}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">
                      {application.evidenceSummary ?? application.applicationNotes}
                    </p>
                  </div>
                  <div className="hidden shrink-0 text-right text-xs text-zinc-400 sm:block">
                    <p>{formatDate(application.submittedAt)}</p>
                    <p className="mt-0.5">Submitted</p>
                  </div>
                  <Badge variant={badge.variant} className="shrink-0">
                    {badge.label}
                  </Badge>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
