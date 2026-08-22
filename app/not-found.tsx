import Link from "next/link";

import { Container } from "@/components/layout/container";
import { PageShell } from "@/components/layout/page-shell";
import { Section } from "@/components/layout/section";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <PageShell>
      <SiteHeader />
      <Section spacing="generous">
        <Container className="animate-fade-in">
          <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-muted-foreground">
            Wardrobe Vault
          </p>
          <h1 className="mt-4 max-w-xl font-heading text-4xl leading-tight sm:text-5xl">
            This page isn&apos;t in the Vault.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            The piece or page you were looking for may have moved, sold, or
            never existed here.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button render={<Link href="/vault" />}>Explore the Vault</Button>
            <Button variant="outline" render={<Link href="/" />}>
              Return home
            </Button>
          </div>
        </Container>
      </Section>
    </PageShell>
  );
}
