"use client";

import { useActionState, useState } from "react";

import {
  adminPayoutActionAction,
  type AdminPayoutActionState,
} from "@/app/actions/admin/payouts";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AdminPayoutAction } from "@/lib/services/payouts/transitionPayoutStatus";

export type PayoutActionOption = {
  action: AdminPayoutAction;
  label: string;
  variant: "default" | "outline" | "destructive";
  requiresReason?: boolean;
};

type Props = {
  payoutId: string;
  availableActions: PayoutActionOption[];
};

const initialState: AdminPayoutActionState = {};

export function PayoutActionPanel({ payoutId, availableActions }: Props) {
  const [state, formAction, pending] = useActionState(
    adminPayoutActionAction,
    initialState,
  );
  const [activeAction, setActiveAction] = useState<PayoutActionOption | null>(
    null,
  );

  if (availableActions.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No further payout actions are available for this status.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-sm text-emerald-700" role="status">
          Payout updated successfully.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {availableActions.map((config) => (
          <Button
            key={config.action}
            type="button"
            variant={config.variant}
            size="sm"
            onClick={() =>
              setActiveAction(
                activeAction?.action === config.action ? null : config,
              )
            }
          >
            {config.label}
          </Button>
        ))}
      </div>

      {activeAction && (
        <form
          action={formAction}
          className="space-y-4 border border-zinc-200 p-4 dark:border-zinc-800"
        >
          <input type="hidden" name="payoutId" value={payoutId} />
          <input type="hidden" name="action" value={activeAction.action} />

          {activeAction.requiresReason && (
            <div className="space-y-2">
              <Label htmlFor="failureReason">Reason</Label>
              <Textarea
                id="failureReason"
                name="failureReason"
                required
                rows={3}
                placeholder="Explain why this payout failed…"
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={pending} size="sm">
              {pending
                ? "Saving…"
                : `Confirm ${activeAction.label.toLowerCase()}`}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveAction(null)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
