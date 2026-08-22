import Link from "next/link";
import { notFound } from "next/navigation";

import { ReportActionPanel } from "@/components/admin/report-action-panel";
import { Badge } from "@/components/ui/badge";
import { REPORT_REASON_LABELS } from "@/lib/schemas/report";
import { getAdminReportDetail } from "@/lib/services/admin/reports";

type PageProps = {
  params: Promise<{ reportId: string }>;
};

function formatDate(date: Date | null | undefined) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function AdminReportDetailPage({ params }: PageProps) {
  const { reportId } = await params;
  const report = await getAdminReportDetail(reportId);

  if (!report) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/reports"
          className="text-xs uppercase tracking-[0.14em] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          ← Reports
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
              Report on {report.listing.title}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {REPORT_REASON_LABELS[report.reason]}
            </p>
          </div>
          <Badge variant="secondary">{report.status}</Badge>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6 rounded-sm border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">
              Reported listing
            </p>
            <Link
              href={`/admin/listings/${report.listing.id}`}
              className="mt-1 block text-sm font-medium hover:underline"
            >
              {report.listing.title}
            </Link>
            <p className="mt-1 text-xs text-zinc-500">
              Seller: {report.listing.seller.name ?? report.listing.seller.email}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">
              Reporter
            </p>
            <p className="mt-1 text-sm">
              {report.reporter.name ?? report.reporter.email}
            </p>
          </div>
          {report.details ? (
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                Details
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{report.details}</p>
            </div>
          ) : null}
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">
              Filed
            </p>
            <p className="mt-1 text-sm">{formatDate(report.createdAt)}</p>
          </div>
          {report.resolutionNotes ? (
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                Resolution notes
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm">
                {report.resolutionNotes}
              </p>
            </div>
          ) : null}
        </div>

        <ReportActionPanel
          reportId={report.id}
          currentStatus={report.status}
        />
      </div>
    </div>
  );
}
