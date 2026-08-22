import Link from "next/link";

import { EmptyState } from "@/components/brand/empty-state";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ItemCard } from "@/components/listings/item-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth/guards";
import { ListingStatus } from "@/lib/generated/prisma/enums";
import { listUserFavorites } from "@/lib/services/wishlist";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const session = await requireAuth();
  const favorites = await listUserFavorites(session.user.id);

  return (
    <>
      <div className="border-b border-border py-6">
        <Container>
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            My Vault
          </p>
          <h1 className="mt-2 font-heading text-3xl">Saved pieces</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Pieces you have marked to return to — quietly held until you are
            ready.
          </p>
        </Container>
      </div>

      <Section spacing="default" className="pt-10">
        <Container>
          {favorites.length === 0 ? (
            <EmptyState
              title="Nothing saved yet."
              description="When a piece catches your eye, save it here to revisit later."
              action={
                <Button variant="outline" render={<Link href="/vault" />}>
                  Explore the Vault
                </Button>
              }
            />
          ) : (
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {favorites.map(({ favoriteId, listing }) => (
                <div key={favoriteId} className="relative">
                  {listing.status === ListingStatus.SOLD && (
                    <Badge
                      variant="secondary"
                      className="absolute right-0 top-0 z-10"
                    >
                      Sold
                    </Badge>
                  )}
                  <ItemCard listing={listing} />
                </div>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
