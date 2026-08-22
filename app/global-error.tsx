"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-full bg-background font-sans text-foreground antialiased">
        <main className="mx-auto flex min-h-full max-w-md flex-col items-center justify-center px-6 py-16 text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-muted-foreground">
            Wardrobe Vault
          </p>
          <h1 className="mt-4 font-heading text-3xl tracking-tight">
            Something went wrong
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            We hit an unexpected problem. Please try again — your pieces and
            orders are unaffected.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-9 items-center justify-center rounded-sm border border-border bg-background px-4 text-sm transition-colors hover:bg-muted"
            >
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex h-9 items-center justify-center rounded-sm border border-transparent bg-primary px-4 text-sm text-primary-foreground"
            >
              Return home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
