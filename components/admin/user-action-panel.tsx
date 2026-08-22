"use client";

import { useActionState, useState } from "react";

import {
  suspendUserAction,
  unsuspendUserAction,
  type AdminUserActionState,
} from "@/app/actions/admin/users";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  userId: string;
  isSuspended: boolean;
};

const initialState: AdminUserActionState = {};

export function UserActionPanel({ userId, isSuspended }: Props) {
  const [state, formAction, pending] = useActionState(
    suspendUserAction,
    initialState,
  );
  const [showSuspend, setShowSuspend] = useState(false);
  const [unsuspendError, setUnsuspendError] = useState<string | null>(null);
  const [unsuspendPending, setUnsuspendPending] = useState(false);

  async function handleUnsuspend() {
    setUnsuspendError(null);
    setUnsuspendPending(true);
    const result = await unsuspendUserAction(userId);
    setUnsuspendPending(false);
    if (result.error) {
      setUnsuspendError(result.error);
    }
  }

  return (
    <div className="space-y-4 rounded-sm border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Account moderation
        </h3>
        <p className="mt-1 text-xs text-zinc-500">
          Suspension blocks sign-in and clears active sessions immediately.
        </p>
      </div>

      {isSuspended ? (
        <div className="space-y-3">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            This account is currently suspended.
          </p>
          {unsuspendError ? (
            <p className="text-sm text-red-600">{unsuspendError}</p>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={unsuspendPending}
            onClick={() => void handleUnsuspend()}
          >
            {unsuspendPending ? "Restoring…" : "Restore account"}
          </Button>
        </div>
      ) : !showSuspend ? (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => setShowSuspend(true)}
        >
          Suspend account
        </Button>
      ) : (
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="userId" value={userId} />
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for suspension</Label>
            <Textarea
              id="reason"
              name="reason"
              rows={3}
              required
              disabled={pending}
            />
          </div>
          {state.error ? (
            <p className="text-sm text-red-600">{state.error}</p>
          ) : null}
          {state.success ? (
            <p className="text-sm text-green-700 dark:text-green-400">
              Account suspended.
            </p>
          ) : null}
          <div className="flex gap-2">
            <Button type="submit" variant="destructive" size="sm" disabled={pending}>
              {pending ? "Suspending…" : "Confirm suspension"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => setShowSuspend(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
