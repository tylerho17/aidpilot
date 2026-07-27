/**
 * Generates a clean, human-readable review packet of AidPilot's FAFSA/CADAA
 * guidance so a financial-aid counselor can vet it for accuracy. Run:
 *   npx tsx scripts/export-review-packet.mts > <out>.md
 * Reads the same typed content the app renders (single source of truth), so the
 * packet can never drift from what students see.
 */
import { FAFSA_GUIDE } from "../lib/fafsa-guide/fafsa";
import { CADAA_GUIDE } from "../lib/fafsa-guide/cadaa";
import { CURRENT_AWARD_YEAR } from "../lib/fafsa-guide/currency";

type Text = Record<string, string> | null;
const en = (t: Text) => (t && t.en ? t.en.trim() : "");

function renderGuide(title: string, guide: typeof FAFSA_GUIDE): string {
  const out: string[] = [`\n## ${title}\n`];
  for (const section of guide) {
    out.push(`\n### ${en(section.title)}\n`);
    if (section.explainer && section.body) {
      out.push(`${en(section.body)}\n`);
      continue;
    }
    for (const field of section.fields) {
      const parts: string[] = [];
      if (field.whatItMeans) parts.push(`- **What it means:** ${en(field.whatItMeans)}`);
      if (field.documentNeeded) parts.push(`- **Document needed:** ${en(field.documentNeeded)}`);
      if (field.commonError) parts.push(`- **Common error:** ${en(field.commonError)}`);
      if (parts.length === 0) continue; // skip fields with no guidance yet
      out.push(`\n**${en(field.label)}**\n`);
      out.push(parts.join("\n"));
      out.push("");
    }
  }
  return out.join("\n");
}

function countFilled(guide: typeof FAFSA_GUIDE): number {
  let n = 0;
  for (const s of guide) for (const f of s.fields) if (f.whatItMeans || f.documentNeeded || f.commonError) n++;
  return n;
}

const header = `# AidPilot — Financial-Aid Guidance: Counselor Review Packet

**Award year covered:** ${CURRENT_AWARD_YEAR}
**Purpose:** Please review the plain-language guidance below for accuracy. This is the exact content AidPilot shows students (generated from the app's source of truth). Every item is sourced; the provenance ledger is in \`docs/content-source.md\`.

**How to review:** Flag anything inaccurate, outdated, or misleading. Note especially anything that could steer a student wrong on eligibility, deadlines, or what to submit. Spanish is rendered in-app; this packet shows the English source.

**Coverage:** FAFSA — ${countFilled(FAFSA_GUIDE)} fields with guidance · CADAA — ${countFilled(CADAA_GUIDE)} fields with guidance.

---`;

process.stdout.write(header + renderGuide("FAFSA guidance", FAFSA_GUIDE) + renderGuide("California Dream Act (CADAA) guidance", CADAA_GUIDE) + "\n");
