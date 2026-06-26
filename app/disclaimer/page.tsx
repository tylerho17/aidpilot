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
      <SectionCard title="AidPilot is not FAFSA" accent="amber">
        <p>AidPilot is an independent educational and organizational tool. We are <strong style={{ color: "#92600A" }}>not FAFSA</strong>, not Federal Student Aid, not the U.S. Department of Education, and <strong style={{ color: "#92600A" }}>not affiliated with, endorsed by, or connected to</strong> any college, university, or scholarship provider.</p>
        <p style={{ marginTop: 12 }}>AidPilot does not submit FAFSA or scholarship applications for users. For federal aid, always use the official website at{" "}
          <a href="https://studentaid.gov" target="_blank" rel="noopener noreferrer" style={{ color: "#92600A", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}>studentaid.gov</a>.
        </p>
      </SectionCard>

      <SectionCard title="Not official financial aid advice">
        <p>AidPilot provides organizational tools, reminders, and educational guidance to help students navigate financial aid. Our content is for informational purposes only. It is <strong style={{ color: "#15212E" }}>not legal, tax, or official financial aid advice</strong>.</p>
        <p style={{ marginTop: 12 }}>Always verify deadlines, requirements, and aid details directly with your school&apos;s financial aid office, state aid agency, and official government sources before making decisions.</p>
      </SectionCard>

      <SectionCard title="No guarantee of aid or scholarships">
        <p>AidPilot cannot guarantee that you will receive financial aid, scholarships, or a specific aid amount. Scholarship matches and recommendations are based on available information and are meant to help you discover opportunities, not to promise outcomes.</p>
      </SectionCard>

      <SectionCard title="Sensitive information" accent="green">
        <p>AidPilot does not ask for or store Social Security numbers, tax returns, FAFSA login credentials, or other sensitive financial documents. Do not share this information with us or enter it into unofficial third-party tools.</p>
        <p style={{ marginTop: 12 }}>AidPilot currently tracks document status only and does not require tax document uploads. Document upload and aid letter scanning features are planned for later.</p>
      </SectionCard>

      <SectionCard title="Third-party scholarships and links">
        <p>AidPilot may surface scholarship opportunities from third parties. We do not control those programs and are not responsible for their application processes, eligibility rules, or award decisions. Review each scholarship&apos;s official requirements before applying.</p>
      </SectionCard>

      <SectionCard title="Your data and account">
        <p>You control your profile data and can update it in Settings. You may request account deletion from Settings or by contacting us. Deletion removes user-owned data associated with your account when the feature is enabled on our servers.</p>
      </SectionCard>

      <SectionCard title="Demo and sample data">
        <p>The marketing homepage may use sample data for illustration only. Demo content does not reflect your actual financial aid status. Authenticated accounts use only your own data.</p>
      </SectionCard>

      <SectionCard title="Contact" accent="blue">
        <p>Questions about this disclaimer? Email us at{" "}
          <a href="mailto:hello@aidpilot.app" style={{ color: "#0B5CAD", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}>hello@aidpilot.app</a>.
        </p>
      </SectionCard>
    </LegalShell>
  );
}
