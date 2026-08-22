"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";

import { ErrorState } from "@/components/brand/error-state";
import { Container } from "@/components/layout/container";
import { PageShell } from "@/components/layout/page-shell";
import { Section } from "@/components/layout/section";
import { SiteHeaderMenu } from "@/components/layout/site-header-menu";
import { Button } from "@/components/ui/button";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <PageShell>
      <header className="relative border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Wardrobe Vault
          </Link>
          <SiteHeaderMenu isAuthenticated={false} />
        </div>
      </header>
      <Section spacing="generous">
        <Container>
          <ErrorState
            title="Something went wrong"
            message="We couldn't open this page just now. Please try again — if it persists, return to the Vault and continue browsing."
            onRetry={reset}
          />
          <div className="mt-2 flex justify-center">
            <Button variant="outline" render={<Link href="/vault" />}>
              Explore the Vault
            </Button>
          </div>
        </Container>
      </Section>
    </PageShell>
  );
}
