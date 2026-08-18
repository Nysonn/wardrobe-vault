"use client";

import { useActionState } from "react";

import { confirmPurchaseAction, type CheckoutActionState } from "@/app/actions/checkout";
import { Button } from "@/components/ui/button";

type ConfirmPurchaseFormProps = {
  listingId: string;
};

export function ConfirmPurchaseForm({ listingId }: ConfirmPurchaseFormProps) {
  const [state, formAction, pending] = useActionState<
    CheckoutActionState,
    FormData
  >(confirmPurchaseAction, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="listingId" value={listingId} />

      {state.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Processing payment…" : "Confirm purchase"}
      </Button>

      <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
        Payment is processed securely through Wardrobe Vault. Funds are held by
        the platform until fulfilment conditions are met — they are not sent
        directly to the seller.
      </p>
    </form>
  );
}
