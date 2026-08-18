"use server";

import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth/guards";
import { checkoutListingIdSchema } from "@/lib/schemas/checkout";
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
      error: parsed.error.issues[0]?.message ?? "Invalid purchase request.",
    };
  }

  try {
    const result = await createOrderFromCheckout(
      session.user.id,
      parsed.data.listingId,
    );

    redirect(`/orders/${result.orderId}?confirmed=1`);
  } catch (error) {
    if (error instanceof OrderServiceError) {
      return { error: error.message };
    }
    throw error;
  }
}
