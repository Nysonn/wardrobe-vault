"use client";

import { useActionState, useState } from "react";

import {
  adminVerificationActionAction,
  type AdminVerificationActionState,
} from "@/app/actions/admin/verification";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VerificationStatus } from "@/lib/generated/prisma/enums";

type Props = {
  applicationId: string;
  currentStatus: VerificationStatus;
  isVerifiedPublicFigure: boolean;
};

type ActionConfig = {
  action: "approve" | "reject" | "revoke";
  label: string;
  requiresReason?: boolean;
  variant: "default" | "outline" | "destructive";
  confirmText?: string;
};

const initialState: AdminVerificationActionState = {};

export function VerificationActionPanel({
  applicationId,
  currentStatus,
  isVerifiedPublicFigure,
}: Props) {
  const [state, formAction, pending] = useActionState(
    adminVerificationActionAction,
    initialState,
  );
  const [selectedAction, setSelectedAction] = useState<ActionConfig | null>(
    null,
  );
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const availableActions: ActionConfig[] = [];

  if (currentStatus === VerificationStatus.PENDING) {
    availableActions.push(
      {
        action: "approve",
        label: "Approve verification",
        variant: "default",
        confirmText:
          "This will grant verified public figure status. It cannot happen automatically — confirm only after reviewing evidence.",
      },
      {
        action: "reject",
        label: "Reject application",
        requiresReason: true,
        variant: "destructive",
      },
    );
  }

  if (
    currentStatus === VerificationStatus.VERIFIED ||
    isVerifiedPublicFigure
  ) {
    availableActions.push({
      action: "revoke",
      label: "Revoke verification",
      requiresReason: true,
      variant: "destructive",
      confirmText:
        "This removes verified public figure status from the account.",
    });
  }

  if (availableActions.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No actions available for this application status.
      </p>
    );
  }

  return (
    <div className="space-y-4 rounded-sm border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Admin actions
        </h3>
        <p className="mt-1 text-xs text-zinc-500">
          Verification is never granted automatically. Every decision is
          recorded in the audit log.
        </p>
      </div>

      {!selectedAction ? (
        <div className="flex flex-wrap gap-2">
          {availableActions.map((config) => (
            <Button
              key={config.action}
              type="button"
              variant={config.variant}
              size="sm"
              onClick={() => setSelectedAction(config)}
            >
              {config.label}
            </Button>
          ))}
        </div>
      ) : (
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="applicationId" value={applicationId} />
          <input type="hidden" name="action" value={selectedAction.action} />

          {selectedAction.confirmText ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {selectedAction.confirmText}
            </p>
          ) : null}

          {selectedAction.requiresReason ? (
            <div className="space-y-2">
              <Label htmlFor="reason">
                Reason {selectedAction.action === "reject" ? "(required)" : ""}
              </Label>
              <Textarea
                id="reason"
                name="reason"
                rows={3}
                required={selectedAction.action === "reject"}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                disabled={pending}
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="notes">Internal notes (optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={2}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              disabled={pending}
            />
          </div>

          {state.error ? (
            <p className="text-sm text-red-600">{state.error}</p>
          ) : null}

          {state.success ? (
            <p className="text-sm text-green-700 dark:text-green-400">
              Action recorded successfully.
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant={selectedAction.variant} disabled={pending}>
              {pending ? "Saving…" : `Confirm ${selectedAction.label.toLowerCase()}`}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => {
                setSelectedAction(null);
                setReason("");
                setNotes("");
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
