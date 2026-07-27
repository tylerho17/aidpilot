import * as Sentry from "@sentry/nextjs";

/**
 * Next.js instrumentation entry. Loads the runtime-appropriate Sentry init and
 * forwards uncaught server/route errors to Sentry via onRequestError. All of it
 * is inert unless SENTRY_DSN is set (see the sentry.*.config files).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
