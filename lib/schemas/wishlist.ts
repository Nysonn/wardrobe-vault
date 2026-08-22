import { z } from "zod";

export const wishlistListingIdSchema = z.object({
  listingId: z.string().min(1, "Please choose a piece to save."),
});

export type WishlistListingIdInput = z.infer<typeof wishlistListingIdSchema>;
