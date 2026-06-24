import Link from "next/link";
import type { Metadata } from "next";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Disclaimer — AidPilot",
  description: "Important information about AidPilot and financial aid guidance.",
};

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-[#f8f7f3] text-[#171717]">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <nav className="mb-12">
          <Link href="/" className="text-sm text-black/50 hover:text-black">
            ← Back to AidPilot
          </Link>
        </nav>

        <h1 className="text-4xl font-semibold tracking-tight">Disclaimer</h1>
        <p className="mt-3 text-sm text-black/50">Last updated: June 24, 2026</p>

        <div className="mt-10 space-y-8 text-base leading-7 text-black/70">
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
            <h2 className="text-lg font-semibold">Independent service</h2>
            <p className="mt-2">
              AidPilot is an independent educational tool. We are{" "}
              <strong>not affiliated with, endorsed by, or connected to</strong>{" "}
              FAFSA, Federal Student Aid, the U.S. Department of Education, or any
              college, university, or scholarship provider.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black">Not official financial aid advice</h2>
            <p className="mt-3">
              AidPilot provides organizational tools, reminders, and educational
              guidance to help students navigate financial aid. Our content is for
              informational purposes only. It is{" "}
              <strong className="text-black">not legal, tax, or official financial aid advice</strong>.
            </p>
            <p className="mt-3">
              Always verify deadlines, requirements, and aid details directly with
              your school&apos;s financial aid office, state aid agency, and official
              government sources.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black">No guarantee of aid or scholarships</h2>
            <p className="mt-3">
              AidPilot cannot guarantee that you will receive financial aid,
              scholarships, or a specific aid amount. Scholarship matches and
              recommendations are based on available information and are meant to
              help you discover opportunities — not to promise outcomes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black">Sensitive information</h2>
            <p className="mt-3">
              AidPilot does not ask for or store Social Security numbers, tax
              returns, FAFSA login credentials, or other sensitive financial
              documents. Do not share this information with us or enter it into
              unofficial third-party tools.
            </p>
            <p className="mt-3">
              For FAFSA and federal aid tasks, always use the official website at{" "}
              <a
                href="https://studentaid.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black underline underline-offset-2"
              >
                studentaid.gov
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black">Third-party scholarships and links</h2>
            <p className="mt-3">
              AidPilot may surface scholarship opportunities from third parties. We
              do not control those programs and are not responsible for their
              application processes, eligibility rules, or award decisions. Review
              each scholarship&apos;s official requirements before applying.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black">Demo and sample data</h2>
            <p className="mt-3">
              Some features, including the demo dashboard, use sample data for
              illustration only. Demo content does not reflect your actual financial
              aid status.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black">Contact</h2>
            <p className="mt-3">
              Questions about this disclaimer? Email us at{" "}
              <a
                href="mailto:hello@aidpilot.app"
                className="text-black underline underline-offset-2"
              >
                hello@aidpilot.app
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
