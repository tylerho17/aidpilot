export type RateLimitHits = Map<string, { count: number; windowStart: number }>;

/**
 * Build a stable per-client key for lightweight route-handler rate limits.
 *
 * Proxies append the address they observed to X-Forwarded-For, so use the
 * right-most value. Trusting the left-most value lets clients rotate a spoofed
 * prefix and bypass limits before expensive upstream work runs.
 */
export function requestRateLimitKey(request: Request): string {
  return `ip:${lastForwardedAddress(request.headers.get("x-forwarded-for")) ?? "unknown"}`;
}

function lastForwardedAddress(value: string | null): string | null {
  if (!value) return null;

  const parts = value.split(",");
  for (let i = parts.length - 1; i >= 0; i -= 1) {
    const candidate = parts[i].trim().replace(/^"|"$/g, "");
    if (candidate && candidate.toLowerCase() !== "unknown") {
      return candidate;
    }
  }

  return null;
}

export function isRateLimited(hits: RateLimitHits, key: string, windowMs: number, maxPerWindow: number): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now - entry.windowStart > windowMs) {
    hits.set(key, { count: 1, windowStart: now });
    return false;
  }
  entry.count += 1;
  return entry.count > maxPerWindow;
}
