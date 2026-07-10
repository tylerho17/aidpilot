#!/usr/bin/env node
/**
 * Generates messages/es.json and messages/vi.json from messages/en.json.
 *
 * v1 policy (AGENT_RULES.md Rule 5): EN is the source of truth. ES/VI are STUBS
 * pending native review — same keys as EN, English fallback values so the app
 * stays navigable, with `_status: "NEEDS_NATIVE_REVIEW"` so it's unmistakable the
 * locale is not yet human-translated. The app also shows a banner when the active
 * locale is not EN. Run this after editing en.json to keep all three in key-parity.
 *
 * Usage: node scripts/gen-stub-locales.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const messagesDir = join(here, "..", "messages");

const en = JSON.parse(readFileSync(join(messagesDir, "en.json"), "utf8"));

for (const locale of ["es", "vi"]) {
  const stub = structuredClone(en);
  stub._status = "NEEDS_NATIVE_REVIEW";
  writeFileSync(join(messagesDir, `${locale}.json`), JSON.stringify(stub, null, 2) + "\n");
  console.log(`wrote messages/${locale}.json (NEEDS_NATIVE_REVIEW)`);
}
