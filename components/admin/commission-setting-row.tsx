"use client";

import { useActionState } from "react";

import {
  updateCommissionSettingAction,
  type AdminCommissionActionState,
} from "@/app/actions/admin/commission";
import { bpsToPercentLabel } from "@/lib/schemas/commission";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { CommissionSettingType } from "@/lib/generated/prisma/enums";

type Setting = {
  id: string;
  type: CommissionSettingType;
  name: string;
  rateBps: number;
  isActive: boolean;
  description: string | null;
  seller: { name: string | null; email: string | null } | null;
  category: { name: string } | null;
};

type Props = {
  setting: Setting;
};

function FormMessage({ state }: { state: AdminCommissionActionState }) {
  if (state.error) {
    return (
      <p className="text-sm text-red-600" role="alert">
        {state.error}
      </p>
    );
  }
  if (state.success) {
    return (
      <p className="text-sm text-emerald-700" role="status">
        Setting updated.
      </p>
    );
  }
  return null;
}

export function CommissionSettingRow({ setting }: Props) {
  const [rateState, rateAction, ratePending] = useActionState<
    AdminCommissionActionState,
    FormData
  >(updateCommissionSettingAction, {});

  const [toggleState, toggleAction, togglePending] = useActionState<
    AdminCommissionActionState,
    FormData
  >(updateCommissionSettingAction, {});

  return (
    <li className="space-y-3 border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-zinc-900 dark:text-zinc-100">
            {setting.name}
          </p>
          <p className="mt-1 text-xs uppercase tracking-wide text-zinc-500">
            {setting.type.replace("_", " ")}
            {setting.seller
              ? ` · ${setting.seller.name ?? setting.seller.email ?? "Seller"}`
              : ""}
            {setting.category ? ` · ${setting.category.name}` : ""}
          </p>
          {setting.description && (
            <p className="mt-2 text-sm text-zinc-500">{setting.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">
            {bpsToPercentLabel(setting.rateBps)}
          </span>
          <Badge variant={setting.isActive ? "default" : "secondary"}>
            {setting.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <form action={rateAction} className="flex items-end gap-2">
          <input type="hidden" name="settingId" value={setting.id} />
          <div>
            <label className="sr-only" htmlFor={`rate-${setting.id}`}>
              Rate percent
            </label>
            <Input
              id={`rate-${setting.id}`}
              name="ratePercent"
              type="number"
              min={0}
              max={100}
              step={0.01}
              defaultValue={(setting.rateBps / 100).toString()}
              className="w-28"
            />
          </div>
          <Button type="submit" size="sm" variant="outline" disabled={ratePending}>
            {ratePending ? "Saving…" : "Update rate"}
          </Button>
        </form>

        <form action={toggleAction}>
          <input type="hidden" name="settingId" value={setting.id} />
          <input
            type="hidden"
            name="isActive"
            value={setting.isActive ? "false" : "true"}
          />
          <Button
            type="submit"
            size="sm"
            variant={setting.isActive ? "destructive" : "default"}
            disabled={togglePending}
          >
            {setting.isActive ? "Deactivate" : "Activate"}
          </Button>
        </form>
      </div>

      <FormMessage state={rateState.error || rateState.success ? rateState : toggleState} />
    </li>
  );
}
