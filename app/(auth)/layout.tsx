import Link from "next/link";

import { Container } from "@/components/layout/container";
import { PageShell } from "@/components/layout/page-shell";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <PageShell tone="cream" className="justify-center">
      <Container width="narrow" className="py-16">
        <div className="mb-10 text-center animate-fade-in">
          <Link
            href="/"
            className="inline-block font-heading text-2xl tracking-[0.18em] uppercase text-foreground transition-vault hover:text-vault-accent"
          >
            Wardrobe Vault
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            Pieces with a history.
          </p>
        </div>
        <div className="animate-fade-in-slow">{children}</div>
      </Container>
    </PageShell>
  );
}
