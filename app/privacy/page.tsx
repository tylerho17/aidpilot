import Link from "next/link";
import type { Metadata } from "next";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — AidPilot",
  description: "How AidPilot collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f8f7f3] text-[#171717]">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <nav className="mb-12">
          <Link href="/" className="text-sm text-black/50 hover:text-black">
            ← Back to AidPilot
          </Link>
        </nav>

        <h1 className="text-4xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-3 text-sm text-black/50">Last updated: June 24, 2026</p>

        <div className="mt-10 space-y-8 text-base leading-7 text-black/70">
          <section>
            <h2 className="text-xl font-semibold text-black">Overview</h2>
            <p className="mt-3">
              AidPilot (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) helps students
              protect financial aid, track deadlines, and find scholarship
              opportunities. This Privacy Policy explains what information we
              collect, how we use it, and the choices you have.
            </p>
            <p className="mt-3">
              AidPilot is an independent service. We are not affiliated with
              FAFSA, Federal Student Aid, the U.S. Department of Education, or any
              college or university.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black">Information we collect</h2>
            <p className="mt-3">We may collect the following types of information:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                <strong className="text-black">Contact information</strong> — such as
                your email address and first name when you join our waitlist.
              </li>
              <li>
                <strong className="text-black">Profile details you choose to share</strong>{" "}
                — such as student type, state, and responses about your financial aid
                experience.
              </li>
              <li>
                <strong className="text-black">Usage information</strong> — such as
                pages visited and features used, collected through standard analytics
                tools.
              </li>
            </ul>
            <p className="mt-3 font-medium text-black">
              We do not collect Social Security numbers, tax documents, FAFSA login
              credentials, or sensitive financial documents.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black">How we use your information</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>To operate and improve AidPilot</li>
              <li>To communicate about early access, updates, and product news</li>
              <li>To understand how students use our tools and what they need most</li>
              <li>To keep our service secure and prevent abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black">How we store and protect data</h2>
            <p className="mt-3">
              Waitlist and account data are stored using Supabase, a hosted database
              provider. We use industry-standard security practices and only collect
              information necessary to provide our service. No system is 100% secure,
              but we work to protect your data responsibly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black">Sharing your information</h2>
            <p className="mt-3">
              We do not sell your personal information. We may share limited data with
              service providers who help us run AidPilot (such as hosting and
              analytics), subject to confidentiality obligations. We may also disclose
              information if required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black">Your choices</h2>
            <p className="mt-3">
              You may request access to, correction of, or deletion of your
              waitlist information by contacting us. You can opt out of marketing
              emails at any time using the unsubscribe link in those messages.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black">Children and students</h2>
            <p className="mt-3">
              AidPilot is designed for students and families navigating financial aid.
              If you are under 18, please use AidPilot with a parent or guardian. We do
              not knowingly collect information from children under 13 without
              parental consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black">Changes to this policy</h2>
            <p className="mt-3">
              We may update this Privacy Policy from time to time. We will post the
              revised version on this page and update the &quot;Last updated&quot; date
              above.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black">Contact us</h2>
            <p className="mt-3">
              Questions about this Privacy Policy? Email us at{" "}
              <a
                href="mailto:privacy@aidpilot.app"
                className="text-black underline underline-offset-2"
              >
                privacy@aidpilot.app
              </a>
              .
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
