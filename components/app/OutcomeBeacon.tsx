"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";

/**
 * Fires the product's north-star outcome event: "aid dollars" a student is
 * securing (grants/scholarships on their offers) + pursuing (potential from
 * open scholarships). Summed across users in Vercel Analytics, this is the
 * metric that proves the product works — "students on AidPilot are securing
 * $X in aid." Renders nothing; fires only when the total changes (guarded via
 * localStorage), so reloads don't inflate the count.
 */
export function OutcomeBeacon({ secured, potential }: { secured: number; potential: number }) {
  const total = Math.round(secured + potential);

  useEffect(() => {
    if (total <= 0) return;
    try {
      const key = "aidpilot.outcome.lastFired.v1";
      const cur = String(total);
      if (window.localStorage.getItem(key) === cur) return;
      window.localStorage.setItem(key, cur);
    } catch {
      /* storage blocked — still fire once this session */
    }
    track("aid_dollars", {
      total,
      secured: Math.round(secured),
      potential: Math.round(potential),
    });
  }, [total, secured, potential]);

  return null;
}
