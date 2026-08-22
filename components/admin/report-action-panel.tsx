"use client";

import { useActionState } from "react";

import {
  adminReportActionAction,
  type AdminReportActionState,
} from "@/app/actions/admin/reports";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ReportStatus } from "@/lib/generated/prisma/enums";

type Props = {
  reportId: string;
  currentStatus: ReportStatus;
};

const initialState: AdminReportActionState = {};

export function ReportActionPanel({ reportId, currentStatus }: Props) {
  const [state, formAction, pending] = useActionState(
    adminReportActionAction,
    initialState,
  );

  const actions = [
    {
      action: "under-review",
      label: "Mark under review",
      variant: "outline" as const,
      show: currentStatus === ReportStatus.OPEN,
    },
    {
      action: "resolve",
      label: "Resolve report",
      variant: "default" as const,
      show:
        currentStatus === ReportStatus.OPEN ||
        currentStatus === ReportStatus.UNDER_REVIEW,
    },
    {
      action: "dismiss",
      label: "Dismiss report",
      variant: "destructive" as const,
      show:
        currentStatus === ReportStatus.OPEN ||
        currentStatus === ReportStatus.UNDER_REVIEW,
    },
  ].filter((item) => item.show);

  if (actions.length === 0) {
    return (
      <p className="text-sm text-zinc-500">This report has been closed.</p>
    );
  }

  return (
    <div className="space-y-4 rounded-sm border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
        Moderation actions
      </h3>

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="reportId" value={reportId} />

        <div className="space-y-2">
          <Label htmlFor="action">Action</Label>
          <select
            id="action"
            name="action"
            required
            disabled={pending}
            className="w-full border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          >
            {actions.map((item) => (
              <option key={item.action} value={item.action}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="resolutionNotes">Resolution notes (optional)</Label>
          <Textarea
            id="resolutionNotes"
            name="resolutionNotes"
            rows={3}
            disabled={pending}
          />
        </div>

        {state.error ? (
          <p className="text-sm text-red-600">{state.error}</p>
        ) : null}
        {state.success ? (
          <p className="text-sm text-green-700 dark:text-green-400">
            Report updated.
          </p>
        ) : null}

        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving…" : "Apply action"}
        </Button>
      </form>
    </div>
  );
}
