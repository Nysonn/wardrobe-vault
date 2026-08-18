"use client";

import { useActionState, useState } from "react";

import { adminListingActionAction, type AdminListingActionState } from "@/app/actions/admin/listings";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ListingStatus } from "@/lib/generated/prisma/enums";
import { canTransitionListing } from "@/lib/services/listings/stateMachine";
import { ListingStatus as LS } from "@/lib/generated/prisma/enums";

type Props = {
  listingId: string;
  currentStatus: ListingStatus;
  currentAdminNotes?: string | null;
};

type ActionConfig = {
  action: string;
  label: string;
  toStatus: ListingStatus | null;
  requiresReason?: boolean;
  requiresNotes?: boolean;
  variant: "default" | "outline" | "destructive";
  confirmText?: string;
};

const ACTION_CONFIGS: ActionConfig[] = [
  {
    action: "approve",
    label: "Approve",
    toStatus: LS.APPROVED,
    variant: "default",
    confirmText: "Approving will allow this listing to be published.",
  },
  {
    action: "reject",
    label: "Reject",
    toStatus: LS.REJECTED,
    requiresReason: true,
    variant: "destructive",
  },
  {
    action: "request-changes",
    label: "Request changes",
    toStatus: LS.DRAFT,
    requiresReason: true,
    variant: "outline",
  },
  {
    action: "suspend",
    label: "Suspend",
    toStatus: LS.SUSPENDED,
    variant: "destructive",
  },
  {
    action: "archive",
    label: "Archive",
    toStatus: LS.ARCHIVED,
    variant: "outline",
  },
  {
    action: "add-note",
    label: "Add internal note",
    toStatus: null,
    requiresNotes: true,
    variant: "outline",
  },
];

const initialState: AdminListingActionState = {};

export function ListingActionPanel({
  listingId,
  currentStatus,
  currentAdminNotes,
}: Props) {
  const [state, formAction, pending] = useActionState(
    adminListingActionAction,
    initialState,
  );
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const availableActions = ACTION_CONFIGS.filter((cfg) => {
    if (cfg.toStatus === null) return true;
    return canTransitionListing(currentStatus, cfg.toStatus);
  });

  const selected = ACTION_CONFIGS.find((c) => c.action === activeAction);

  return (
    <div className="space-y-4 rounded-sm border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
        Moderation actions
      </h3>

      {state.success ? (
        <p className="rounded-sm border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
          Action completed.
        </p>
      ) : null}

      {state.error ? (
        <p className="rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.error}
        </p>
      ) : null}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {availableActions.map((cfg) => (
          <Button
            key={cfg.action}
            type="button"
            size="sm"
            variant={activeAction === cfg.action ? "default" : cfg.variant}
            onClick={() =>
              setActiveAction(activeAction === cfg.action ? null : cfg.action)
            }
          >
            {cfg.label}
          </Button>
        ))}
      </div>

      {/* Expanded action form */}
      {selected ? (
        <form action={formAction} className="space-y-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <input type="hidden" name="listingId" value={listingId} />
          <input type="hidden" name="action" value={selected.action} />

          {selected.confirmText ? (
            <p className="text-xs text-zinc-500">{selected.confirmText}</p>
          ) : null}

          {selected.requiresReason ? (
            <div className="space-y-1.5">
              <Label htmlFor={`reason-${selected.action}`}>
                Reason{" "}
                <span className="text-zinc-400">(shown to seller)</span>
              </Label>
              <Textarea
                id={`reason-${selected.action}`}
                name="reason"
                rows={3}
                placeholder="Explain what needs to change or why this listing was rejected."
                required
              />
            </div>
          ) : null}

          {selected.requiresNotes || selected.action === "add-note" ? (
            <div className="space-y-1.5">
              <Label htmlFor={`notes-${selected.action}`}>
                Internal note{" "}
                <span className="text-zinc-400">(admin only)</span>
              </Label>
              <Textarea
                id={`notes-${selected.action}`}
                name="notes"
                rows={3}
                placeholder="Internal context visible only to admins."
                required={selected.action === "add-note"}
              />
            </div>
          ) : null}

          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Saving…" : `Confirm: ${selected.label}`}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setActiveAction(null)}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : null}

      {/* Current internal notes */}
      {currentAdminNotes ? (
        <div className="space-y-1.5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
            Internal notes
          </p>
          <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
            {currentAdminNotes}
          </p>
        </div>
      ) : null}
    </div>
  );
}
