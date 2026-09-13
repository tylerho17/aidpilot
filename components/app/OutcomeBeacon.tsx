"use client";

import { useEffect, useRef } from "react";
import { track } from "@vercel/analytics";

type OutcomeSnapshot = {
  total: number;
  secured: number;
  potential: number;
};

const EMPTY_SNAPSHOT: OutcomeSnapshot = { total: 0, secured: 0, potential: 0 };

function roundedSnapshot(secured: number, potential: number): OutcomeSnapshot {
  const roundedSecured = Math.round(secured);
  const roundedPotential = Math.round(potential);
  return {
    total: roundedSecured + roundedPotential,
    secured: roundedSecured,
    potential: roundedPotential,
  };
}

function normalizeSnapshot(raw: Partial<OutcomeSnapshot> | null | undefined): OutcomeSnapshot {
  return {
    total: typeof raw?.total === "number" ? raw.total : 0,
    secured: typeof raw?.secured === "number" ? raw.secured : 0,
    potential: typeof raw?.potential === "number" ? raw.potential : 0,
  };
}

function sameSnapshot(a: OutcomeSnapshot, b: OutcomeSnapshot): boolean {
  return a.total === b.total && a.secured === b.secured && a.potential === b.potential;
}

function legacyTotal(raw: string | null): number | null {
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Fires the product's north-star outcome event: "aid dollars" a student is
 * securing (grants/scholarships on their offers) + pursuing (potential from
 * open scholarships). Summed across users in Vercel Analytics, this is the
 * metric that proves the product works — "students on AidPilot are securing
 * $X in aid." Renders nothing; emits only the per-account delta since the last
 * snapshot, so reloads and later total changes don't double-count the same aid.
 */
export function OutcomeBeacon({
  secured,
  potential,
  scopeKey,
}: {
  secured: number;
  potential: number;
  scopeKey: string;
}) {
  const { total: currentTotal, secured: currentSecured, potential: currentPotential } = roundedSnapshot(secured, potential);
  const fallbackSnapshotRef = useRef<{ key: string; snapshot: OutcomeSnapshot } | null>(null);

  useEffect(() => {
    const key = `aidpilot.outcome.lastFired.v2.${scopeKey}`;
    const legacyKey = "aidpilot.outcome.lastFired.v1";
    const current = { total: currentTotal, secured: currentSecured, potential: currentPotential };
    let previous = fallbackSnapshotRef.current?.key === key ? fallbackSnapshotRef.current.snapshot : EMPTY_SNAPSHOT;
    let fromLegacyTotal = false;

    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        previous = normalizeSnapshot(JSON.parse(raw) as Partial<OutcomeSnapshot>);
      } else {
        const oldTotal = legacyTotal(window.localStorage.getItem(legacyKey));
        if (oldTotal !== null) {
          previous = { total: oldTotal, secured: current.secured, potential: current.potential };
          fromLegacyTotal = true;
        } else {
          previous = EMPTY_SNAPSHOT;
        }
      }
    } catch {
      /* storage blocked — fall back to the in-session snapshot */
    }

    if (!fromLegacyTotal && sameSnapshot(previous, current)) {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(current));
    } catch {
      /* storage blocked — still fire once this session */
    }
    fallbackSnapshotRef.current = { key, snapshot: current };

    const delta = {
      total: current.total - previous.total,
      secured: fromLegacyTotal ? 0 : current.secured - previous.secured,
      potential: fromLegacyTotal ? 0 : current.potential - previous.potential,
    };
    if (delta.total === 0 && delta.secured === 0 && delta.potential === 0) {
      return;
    }

    track("aid_dollars", {
      total: delta.total,
      secured: delta.secured,
      potential: delta.potential,
    });
  }, [currentPotential, currentSecured, currentTotal, scopeKey]);

  return null;
}
