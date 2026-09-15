"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";

const firedThisSession = new Set<string>();

/**
 * Fires the product's north-star outcome event: "aid dollars" a student is
 * securing (grants/scholarships on their offers) + pursuing (potential from
 * open scholarships). Summed across users in Vercel Analytics, this is the
 * metric that proves the product works. Renders nothing; fires only when a
 * signed-in, non-demo user's total changes.
 */
export function OutcomeBeacon({
  secured,
  potential,
  userId,
  enabled = true,
}: {
  secured: number;
  potential: number;
  userId: string | null;
  enabled?: boolean;
}) {
  const total = Math.round(secured + potential);

  useEffect(() => {
    if (!enabled || !userId || total <= 0) return;
    const sessionKey = `${userId}:${total}`;
    try {
      const key = `aidpilot.outcome.lastFired.v2.${userId}`;
      const cur = String(total);
      if (window.localStorage.getItem(key) === cur) return;
      window.localStorage.setItem(key, cur);
    } catch {
      if (firedThisSession.has(sessionKey)) return;
      firedThisSession.add(sessionKey);
    }
    track("aid_dollars", {
      total,
      secured: Math.round(secured),
      potential: Math.round(potential),
    });
  }, [enabled, total, secured, potential, userId]);

  return null;
}
