"use client";

import { useActionState } from "react";

import {
  updateMarketplaceSettingsAction,
  type AdminSettingsActionState,
} from "@/app/actions/admin/settings";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  verificationPolicy: string;
  shippingGuidance: string;
  currency: string;
};

const initialState: AdminSettingsActionState = {};

export function MarketplaceSettingsForm({
  verificationPolicy,
  shippingGuidance,
  currency,
}: Props) {
  const [state, formAction, pending] = useActionState(
    updateMarketplaceSettingsAction,
    initialState,
  );

  return (
    <div className="space-y-8">
      <section className="rounded-sm border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Currency
        </h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Marketplace currency is locked to{" "}
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {currency}
          </span>{" "}
          for MVP. All prices and payouts are stored as whole shillings.
        </p>
      </section>

      <form action={formAction} className="space-y-6">
        <section className="space-y-3 rounded-sm border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Verification rules
          </h3>
          <Label htmlFor="verificationPolicy" className="sr-only">
            Verification policy
          </Label>
          <Textarea
            id="verificationPolicy"
            name="verificationPolicy"
            rows={6}
            defaultValue={verificationPolicy}
            required
            disabled={pending}
          />
        </section>

        <section className="space-y-3 rounded-sm border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Shipping guidance
          </h3>
          <Label htmlFor="shippingGuidance" className="sr-only">
            Shipping guidance
          </Label>
          <Textarea
            id="shippingGuidance"
            name="shippingGuidance"
            rows={6}
            defaultValue={shippingGuidance}
            required
            disabled={pending}
          />
        </section>

        {state.error ? (
          <p className="text-sm text-red-600">{state.error}</p>
        ) : null}
        {state.success ? (
          <p className="text-sm text-green-700 dark:text-green-400">
            Settings saved.
          </p>
        ) : null}

        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save marketplace settings"}
        </Button>
      </form>
    </div>
  );
}
