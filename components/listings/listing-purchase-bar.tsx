import Link from "next/link";

import { WishlistButton } from "@/components/listings/wishlist-button";
import { Button } from "@/components/ui/button";
import { formatUgx } from "@/lib/format/currency";

type ListingPurchaseBarProps = {
  listingId: string;
  price: number;
  checkoutHref: string;
  loginHref: string;
  isAuthenticated: boolean;
  initialFavorited: boolean;
};

export function ListingPurchaseBar({
  listingId,
  price,
  checkoutHref,
  loginHref,
  isAuthenticated,
  initialFavorited,
}: ListingPurchaseBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-sm lg:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Price
          </p>
          <p className="truncate font-heading text-lg">{formatUgx(price)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isAuthenticated ? (
            <>
              <WishlistButton
                listingId={listingId}
                initialFavorited={initialFavorited}
              />
              <Button render={<Link href={checkoutHref} />}>Purchase</Button>
            </>
          ) : (
            <Button render={<Link href={loginHref} />}>Sign in</Button>
          )}
        </div>
      </div>
    </div>
  );
}
