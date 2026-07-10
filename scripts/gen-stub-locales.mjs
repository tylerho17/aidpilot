#!/usr/bin/env node
/**
 * Generates messages/es.json and messages/vi.json from messages/en.json.
 *
 * v1 policy (AGENT_RULES.md Rule 5): EN is the source of truth. ES/VI are
 * NEEDS_NATIVE_REVIEW — never machine-translate aid content.
 *
 * Owner-supplied DRAFT translations may live in messages/<locale>.overrides.json
 * (currently es.overrides.json); they are deep-merged over the EN clone so the
 * catalog stays reproducible while drafts persist across regeneration. Drafts
 * are still flagged NEEDS_NATIVE_REVIEW — the override cannot mark a locale
 * approved. Vietnamese has no overrides: vi.json is a pure EN stub.
 *
 * Run after every edit to en.json (or an overrides file).
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const messagesDir = join(here, "..", "messages");

const en = JSON.parse(readFileSync(join(messagesDir, "en.json"), "utf8"));

function deepMerge(target, patch) {
  for (const [k, v] of Object.entries(patch)) {
    if (v && typeof v === "object" && !Array.isArray(v) && typeof target[k] === "object") {
      deepMerge(target[k], v);
    } else {
      target[k] = v;
    }
  }
}

for (const locale of ["es", "vi"]) {
  const stub = structuredClone(en);
  const overridesPath = join(messagesDir, `${locale}.overrides.json`);
  let drafts = 0;
  if (existsSync(overridesPath)) {
    const overrides = JSON.parse(readFileSync(overridesPath, "utf8"));
    delete overrides._note;
    deepMerge(stub, overrides);
    drafts = JSON.stringify(overrides).length;
  }
  // Always last: drafts never upgrade a locale past NEEDS_NATIVE_REVIEW.
  stub._status = "NEEDS_NATIVE_REVIEW";
  writeFileSync(join(messagesDir, `${locale}.json`), JSON.stringify(stub, null, 2) + "\n");
  console.log(`wrote messages/${locale}.json (NEEDS_NATIVE_REVIEW${drafts ? ", with draft overrides" : ", pure EN stub"})`);
}
