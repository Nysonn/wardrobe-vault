import Link from "next/link";
import { notFound } from "next/navigation";

import { VerificationActionPanel } from "@/components/admin/verification-action-panel";
import { Badge } from "@/components/ui/badge";
import { VerificationStatus } from "@/lib/generated/prisma/enums";
import { getAdminVerificationDetail } from "@/lib/services/admin/verification";

type PageProps = {
  params: Promise<{ applicationId: string }>;
};

function formatDate(date: Date | null | undefined) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

const STATUS_LABEL: Record<VerificationStatus, string> = {
  [VerificationStatus.UNVERIFIED]: "Unverified",
  [VerificationStatus.PENDING]: "Pending review",
  [VerificationStatus.VERIFIED]: "Verified",
  [VerificationStatus.REVOKED]: "Revoked",
};

function Field({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-200">
        {value}
      </p>
    </div>
  );
}

export default async function AdminVerificationDetailPage({
  params,
}: PageProps) {
  const { applicationId } = await params;
  const detail = await getAdminVerificationDetail(applicationId);

  if (!detail) {
    notFound();
  }

  const { application, history } = detail;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/verification"
          className="text-xs uppercase tracking-[0.14em] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          ← Verification queue
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
              {application.user.name ?? application.user.email}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">{application.user.email}</p>
          </div>
          <Badge variant="secondary">
            {STATUS_LABEL[application.status]}
          </Badge>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8">
          <section className="space-y-4 rounded-sm border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Application
            </h3>
            <Field label="Submitted" value={formatDate(application.submittedAt)} />
            <Field label="Application notes" value={application.applicationNotes} />
            <Field label="Evidence summary" value={application.evidenceSummary} />
            {application.adminDecision ? (
              <Field label="Admin decision" value={application.adminDecision} />
            ) : null}
            {application.adminNotes ? (
              <Field label="Admin notes" value={application.adminNotes} />
            ) : null}
            {application.reviewer ? (
              <Field
                label="Reviewed by"
                value={
                  application.reviewer.name ?? application.reviewer.email ?? "—"
                }
              />
            ) : null}
            <Field label="Reviewed at" value={formatDate(application.reviewedAt)} />
          </section>

          <section className="space-y-4 rounded-sm border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Evidence ({application.evidenceUrls.length})
            </h3>
            {application.evidenceUrls.length === 0 ? (
              <p className="text-sm text-zinc-500">No evidence files attached.</p>
            ) : (
              <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {application.evidenceUrls.map((url) => (
                  <li key={url} className="py-2">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-sm text-zinc-800 underline-offset-4 hover:underline dark:text-zinc-200"
                    >
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {history.length > 1 ? (
            <section className="space-y-3 rounded-sm border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Prior applications
              </h3>
              <ul className="divide-y divide-zinc-100 text-sm dark:divide-zinc-800">
                {history.map((entry) => (
                  <li key={entry.id} className="flex justify-between gap-4 py-2">
                    <span>
                      {STATUS_LABEL[entry.status]}
                      {entry.adminDecision
                        ? ` · ${entry.adminDecision}`
                        : ""}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {formatDate(entry.submittedAt)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <VerificationActionPanel
          applicationId={application.id}
          currentStatus={application.status}
          isVerifiedPublicFigure={application.user.isVerifiedPublicFigure}
        />
      </div>
    </div>
  );
}
