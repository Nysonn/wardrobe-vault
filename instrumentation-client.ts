import * as Sentry from "@sentry/nextjs";

// Client-side Sentry init. No-ops safely if SENTRY_DSN is unset (local dev
// without a configured Sentry project).
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
