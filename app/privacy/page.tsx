import type { Metadata } from "next";
import { LegalShell, SectionCard } from "@/components/LegalShell";

export const metadata: Metadata = {
  title: "Privacy Policy -- AidPilot",
  description: "How AidPilot collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <LegalShell
      badge="Trust and safety"
      heading="Privacy Policy"
      lastUpdated="June 24, 2026"
    >
      {/* trust callout */}
      <SectionCard accent="green">
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <span style={{ display: "flex", width: 36, height: 36, borderRadius: 10, background: "#15885A", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l7 3v5c0 4.4-3 6.8-7 8-4-1.2-7-3.6-7-8V6l7-3Z" />
              <polyline points="9 12 11 14 15 9.5" />
            </svg>
          </span>
          <div>
            <p style={{ fontWeight: 700, color: "#15212E", margin: "0 0 6px", fontSize: 15.5 }}>AidPilot does not collect sensitive financial data.</p>
            <p style={{ margin: 0, color: "#374151" }}>We do not collect Social Security numbers, tax documents, FAFSA login credentials, or sensitive financial documents. We never will.</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Overview">
        <p>AidPilot (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) helps students protect financial aid, track deadlines, and find scholarship opportunities. This Privacy Policy explains what information we collect, how we use it, and the choices you have.</p>
        <p style={{ marginTop: 12 }}>AidPilot is an independent service. We are not affiliated with FAFSA, Federal Student Aid, the U.S. Department of Education, or any college or university.</p>
      </SectionCard>

      <SectionCard title="Information we collect">
        <p>We may collect the following types of information:</p>
        <ul style={{ marginTop: 12, paddingLeft: 22, display: "flex", flexDirection: "column", gap: 8 }}>
          <li><strong style={{ color: "#15212E" }}>Contact information</strong> -- such as your email address and first name when you join our waitlist.</li>
          <li><strong style={{ color: "#15212E" }}>Profile details you choose to share</strong> -- such as student type, state, and responses about your financial aid experience.</li>
          <li><strong style={{ color: "#15212E" }}>Usage information</strong> -- such as pages visited and features used, collected through standard analytics tools.</li>
        </ul>
        <p style={{ marginTop: 16, fontWeight: 700, color: "#15212E" }}>We do not collect Social Security numbers, tax documents, FAFSA login credentials, or sensitive financial documents.</p>
      </SectionCard>

      <SectionCard title="How we use your information">
        <ul style={{ paddingLeft: 22, display: "flex", flexDirection: "column", gap: 8 }}>
          <li>To operate and improve AidPilot</li>
          <li>To communicate about early access, updates, and product news</li>
          <li>To understand how students use our tools and what they need most</li>
          <li>To keep our service secure and prevent abuse</li>
        </ul>
      </SectionCard>

      <SectionCard title="How we store and protect data">
        <p>Waitlist and account data are stored using Supabase, a hosted database provider. We use industry-standard security practices and only collect information necessary to provide our service. No system is 100% secure, but we work to protect your data responsibly.</p>
      </SectionCard>

      <SectionCard title="Sharing your information">
        <p>We do not sell your personal information. We may share limited data with service providers who help us run AidPilot (such as hosting and analytics), subject to confidentiality obligations. We may also disclose information if required by law.</p>
      </SectionCard>

      <SectionCard title="Your choices">
        <p>You may request access to, correction of, or deletion of your waitlist information by contacting us. You can opt out of marketing emails at any time using the unsubscribe link in those messages.</p>
      </SectionCard>

      <SectionCard title="Children and students">
        <p>AidPilot is designed for students and families navigating financial aid. If you are under 18, please use AidPilot with a parent or guardian. We do not knowingly collect information from children under 13 without parental consent.</p>
      </SectionCard>

      <SectionCard title="Changes to this policy">
        <p>We may update this Privacy Policy from time to time. We will post the revised version on this page and update the &quot;Last updated&quot; date above.</p>
      </SectionCard>

      <SectionCard title="Contact us" accent="blue">
        <p>Questions about this Privacy Policy? Email us at{" "}
          <a href="mailto:privacy@aidpilot.app" style={{ color: "#0B5CAD", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}>privacy@aidpilot.app</a>.
        </p>
      </SectionCard>
    </LegalShell>
  );
}
