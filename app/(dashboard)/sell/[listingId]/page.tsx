import { notFound } from "next/navigation";

import { ListingForm } from "@/components/listings/listing-form";
import { Container } from "@/components/layout/container";
import { PageShell } from "@/components/layout/page-shell";
import { Section } from "@/components/layout/section";
import { requireAuth } from "@/lib/auth/guards";
import { getActiveCategories, getSellerListingForEdit } from "@/lib/services/listings";

type PageProps = {
  params: Promise<{ listingId: string }>;
};

export default async function EditListingPage({ params }: PageProps) {
  const session = await requireAuth();
  const { listingId } = await params;

  const [listing, categories] = await Promise.all([
    getSellerListingForEdit(session.user.id, listingId),
    getActiveCategories(),
  ]);

  if (!listing) {
    notFound();
  }

  return (
    <PageShell>
      <Section>
        <Container width="narrow">
          <div className="mb-8 space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Sell
            </p>
            <h1 className="font-heading text-3xl">Edit listing</h1>
          </div>
          <ListingForm
            mode="edit"
            listingId={listing.id}
            categories={categories}
            defaultValues={{
              title: listing.title,
              categoryId: listing.category?.id,
              brand: listing.brand ?? undefined,
              designer: listing.designer ?? undefined,
              price: listing.price,
              size: listing.size ?? undefined,
              color: listing.color ?? undefined,
              material: listing.material ?? undefined,
              condition: listing.condition ?? undefined,
              wornByName: listing.wornByName ?? undefined,
              wornBySeller: listing.wornBySeller,
              wornWhere: listing.wornWhere ?? undefined,
              eventName: listing.eventName ?? undefined,
              timesWorn: listing.timesWorn ?? undefined,
              storyDetails: listing.storyDetails ?? undefined,
              authenticityNotes: listing.authenticityNotes ?? undefined,
              images: listing.images.map((img, i) => ({
                cloudinaryPublicId: img.cloudinaryPublicId,
                url: img.url,
                width: img.width ?? 0,
                height: img.height ?? 0,
                sortOrder: img.sortOrder ?? i,
                altText: img.altText ?? undefined,
              })),
              documents: listing.documents.map((doc) => ({
                cloudinaryPublicId: doc.cloudinaryPublicId,
                url: doc.url,
                type: doc.type,
                fileName: doc.fileName ?? undefined,
                mimeType: doc.mimeType ?? undefined,
              })),
            }}
          />
        </Container>
      </Section>
    </PageShell>
  );
}
