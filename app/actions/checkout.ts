"use server";

import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth/guards";
import { checkoutListingIdSchema } from "@/lib/schemas/checkout";
import {
  resolveActionError,
  validationMessage,
} from "@/lib/errors/action-error";
import {
  createOrderFromCheckout,
  OrderServiceError,
} from "@/lib/services/orders";

export type CheckoutActionState = {
  error?: string;
};

export async function confirmPurchaseAction(
  _prevState: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
  const session = await requireAuth();

  const listingId = formData.get("listingId");
  const parsed = checkoutListingIdSchema.safeParse({ listingId });

  if (!parsed.success) {
    return {
      error: validationMessage(
        parsed.error,
        "We couldn't process this purchase. Return to the listing and try again.",
      ),
    };
  }

  try {
    const result = await createOrderFromCheckout(
      session.user.id,
      parsed.data.listingId,
    );

    redirect(`/orders/${result.orderId}?confirmed=1`);
  } catch (error) {
    return resolveActionError(error, {
      context: "checkout.confirmPurchase",
      serviceErrors: [OrderServiceError],
      fallback:
        "Something went wrong while confirming your purchase. Please try again.",
    });
  }
}
