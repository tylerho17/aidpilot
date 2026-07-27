import * as Sentry from "@sentry/nextjs";

/**
 * Browser-side Sentry init. No-op unless NEXT_PUBLIC_SENTRY_DSN is set, so the
 * client stays clean until you wire up a Sentry project. Captures unhandled
 * client errors + navigation instrumentation once enabled.
 */
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
    enabled: process.env.NODE_ENV === "production",
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
