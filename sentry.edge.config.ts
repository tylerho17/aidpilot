import * as Sentry from "@sentry/nextjs";

/** Edge-runtime Sentry init. No-op unless SENTRY_DSN is set. */
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    enabled: process.env.NODE_ENV === "production",
  });
}
