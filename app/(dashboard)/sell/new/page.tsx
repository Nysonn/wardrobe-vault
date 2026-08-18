import { requireAuth } from "@/lib/auth/guards";
import { ListingForm } from "@/components/listings/listing-form";
import { getActiveCategories } from "@/lib/services/listings";
import { Container } from "@/components/layout/container";
import { PageShell } from "@/components/layout/page-shell";
import { Section } from "@/components/layout/section";

export default async function NewListingPage() {
  await requireAuth();
  const categories = await getActiveCategories();

  return (
    <PageShell>
      <Section>
        <Container width="narrow">
          <div className="mb-8 space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Sell
            </p>
            <h1 className="font-heading text-3xl">New listing</h1>
          </div>
          <ListingForm mode="create" categories={categories} />
        </Container>
      </Section>
    </PageShell>
  );
}
