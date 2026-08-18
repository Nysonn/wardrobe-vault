import { z } from "zod";

export const checkoutListingIdSchema = z.object({
  listingId: z.string().min(1, "Please choose a piece to purchase."),
});

export type CheckoutListingIdInput = z.infer<typeof checkoutListingIdSchema>;
