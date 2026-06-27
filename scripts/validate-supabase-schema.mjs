import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function read(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const migration = read("supabase/012_scholarship_profile_schema_fixes.sql");
const readme = read("README.md");

assert(
  /alter table public\.student_profiles\s+add column if not exists scholarship_preferences jsonb;/i.test(migration),
  "012 migration must add student_profiles.scholarship_preferences as jsonb."
);

assert(
  /alter column scholarship_preferences set not null/i.test(migration),
  "012 migration must make scholarship_preferences non-null for app reads."
);

assert(
  /references public\.scholarship_sources \(id\)\s+on delete set null/i.test(migration),
  "012 migration must point scholarship_matches.scholarship_id at scholarship_sources."
);

assert(
  /drop constraint/i.test(migration) && /scholarship_matches/i.test(migration),
  "012 migration must drop the legacy scholarship_matches.scholarship_id FK before replacing it."
);

assert(
  readme.includes("supabase/012_scholarship_profile_schema_fixes.sql"),
  "README migration order must include 012_scholarship_profile_schema_fixes.sql."
);

console.log("Supabase schema invariants validated.");
