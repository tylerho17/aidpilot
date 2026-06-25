import type { Metadata } from "next";
import { LegalShell, SectionCard } from "@/components/LegalShell";

export const metadata: Metadata = {
  title: "Disclaimer -- AidPilot",
  description: "Important information about AidPilot and financial aid guidance.",
};

export default function DisclaimerPage() {
  return (
    <LegalShell
      badge="Trust and safety"
      heading="Disclaimer"
      lastUpdated="June 24, 2026"
    >
      {/* independent service callout (amber) */}
      <SectionCard title="Independent service" accent="amber">
        <p>AidPilot is an independent educational tool. We are <strong style={{ color: "#92600A" }}>not affiliated with, endorsed by, or connected to</strong> FAFSA, Federal Student Aid, the U.S. Department of Education, or any college, university, or scholarship provider.</p>
      </SectionCard>

      {/* not official advice */}
      <SectionCard title="Not official financial aid advice">
        <p>AidPilot provides organizational tools, reminders, and educational guidance to help students navigate financial aid. Our content is for informational purposes only. It is <strong style={{ color: "#15212E" }}>not legal, tax, or official financial aid advice</strong>.</p>
        <p style={{ marginTop: 12 }}>Always verify deadlines, requirements, and aid details directly with your school&apos;s financial aid office, state aid agency, and official government sources.</p>
      </SectionCard>

      {/* no guarantee */}
      <SectionCard title="No guarantee of aid or scholarships">
        <p>AidPilot cannot guarantee that you will receive financial aid, scholarships, or a specific aid amount. Scholarship matches and recommendations are based on available information and are meant to help you discover opportunities -- not to promise outcomes.</p>
      </SectionCard>

      {/* sensitive info callout (green) */}
      <SectionCard title="Sensitive information" accent="green">
        <p>AidPilot does not ask for or store Social Security numbers, tax returns, FAFSA login credentials, or other sensitive financial documents. Do not share this information with us or enter it into unofficial third-party tools.</p>
        <p style={{ marginTop: 12 }}>For FAFSA and federal aid tasks, always use the official website at{" "}
          <a href="https://studentaid.gov" target="_blank" rel="noopener noreferrer" style={{ color: "#15885A", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}>studentaid.gov</a>.
        </p>
      </SectionCard>

      {/* third party */}
      <SectionCard title="Third-party scholarships and links">
        <p>AidPilot may surface scholarship opportunities from third parties. We do not control those programs and are not responsible for their application processes, eligibility rules, or award decisions. Review each scholarship&apos;s official requirements before applying.</p>
      </SectionCard>

      {/* demo data */}
      <SectionCard title="Demo and sample data">
        <p>Some features, including the demo dashboard, use sample data for illustration only. Demo content does not reflect your actual financial aid status.</p>
      </SectionCard>

      {/* contact */}
      <SectionCard title="Contact" accent="blue">
        <p>Questions about this disclaimer? Email us at{" "}
          <a href="mailto:hello@aidpilot.app" style={{ color: "#0B5CAD", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}>hello@aidpilot.app</a>.
        </p>
      </SectionCard>
    </LegalShell>
  );
}
