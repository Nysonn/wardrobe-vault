"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/guards";
import {
  resolveActionError,
  validationMessage,
} from "@/lib/errors/action-error";
import { wishlistListingIdSchema } from "@/lib/schemas/wishlist";
import {
  addFavorite,
  removeFavorite,
  WishlistServiceError,
} from "@/lib/services/wishlist";

export type WishlistActionState = {
  error?: string;
  favorited?: boolean;
};

export async function toggleWishlistAction(
  listingId: string,
  currentlyFavorited: boolean,
): Promise<WishlistActionState> {
  const session = await requireAuth();
  const parsed = wishlistListingIdSchema.safeParse({ listingId });

  if (!parsed.success) {
    return {
      error: validationMessage(parsed.error, "We couldn't save that piece."),
    };
  }

  try {
    const result = currentlyFavorited
      ? await removeFavorite(session.user.id, parsed.data.listingId)
      : await addFavorite(session.user.id, parsed.data.listingId);

    revalidatePath("/wishlist");
    revalidatePath(`/vault/${parsed.data.listingId}`);

    return { favorited: result.favorited };
  } catch (error) {
    return resolveActionError(error, {
      context: "wishlist.toggle",
      serviceErrors: [WishlistServiceError],
      fallback: "Something went wrong while updating your saved pieces.",
    });
  }
}
