import * as Sentry from "@sentry/nextjs";

/**
 * Server-side Sentry init. No-op unless SENTRY_DSN is set, so error monitoring
 * stays completely off until you create a Sentry project and add the env var —
 * nothing changes in prod behavior until then.
 */
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    // Don't send local development noise.
    enabled: process.env.NODE_ENV === "production",
  });
}
