"use client";

import { useState, useTransition } from "react";
import { HeartIcon } from "lucide-react";

import { toggleWishlistAction } from "@/app/actions/wishlist";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type WishlistButtonProps = {
  listingId: string;
  initialFavorited: boolean;
  className?: string;
};

export function WishlistButton({
  listingId,
  initialFavorited,
  className,
}: WishlistButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [error, setError] = useState<string | null>(null);

  function handleToggle() {
    setError(null);
    startTransition(async () => {
      const result = await toggleWishlistAction(listingId, favorited);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (typeof result.favorited === "boolean") {
        setFavorited(result.favorited);
      }
    });
  }

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={handleToggle}
        className="gap-2"
      >
        <HeartIcon
          className={cn(
            "size-4",
            favorited && "fill-current text-vault-accent",
          )}
        />
        {favorited ? "Saved" : "Save to wishlist"}
      </Button>
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
