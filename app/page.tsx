"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Footer } from "@/components/Footer";

export default function Home() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [studentType, setStudentType] = useState("");
  const [state, setState] = useState("");
  const [biggestPain, setBiggestPain] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const { error } = await supabase.from("waitlist").insert({
      email,
      first_name: firstName,
      student_type: studentType,
      state,
      biggest_pain: biggestPain,
    });

    if (error) {
      console.error(error);

      if (error.code === "23505") {
        setMessage("You are already on the waitlist.");
      } else {
        setMessage("Something went wrong. Try again.");
      }

      setStatus("error");
      return;
    }

    setStatus("success");
    setMessage("You are on the waitlist. We will reach out with early access.");

    setEmail("");
    setFirstName("");
    setStudentType("");
    setState("");
    setBiggestPain("");
  }

  return (
    <main className="min-h-screen bg-[#f8f7f3] text-[#171717]">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <nav className="flex items-center justify-between">
          <div className="text-xl font-semibold tracking-tight">AidPilot</div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden rounded-full border border-black/10 px-5 py-2 text-sm hover:bg-white sm:inline"
            >
              View demo
            </Link>
            <a
              href="#waitlist"
              className="rounded-full border border-black/10 px-5 py-2 text-sm hover:bg-black hover:text-white"
            >
              Join waitlist
            </a>
          </div>
        </nav>

        <div className="grid flex-1 items-center gap-12 py-20 md:grid-cols-2">
          <div>
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-black/50">
              Financial aid copilot for students
            </p>

            <h1 className="text-5xl font-semibold leading-tight tracking-tight md:text-7xl">
              Protect your aid. Find more college money every week.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-black/65">
              AidPilot is your weekly financial aid copilot. We help you avoid
              FAFSA mistakes, catch missing documents before they cost you aid,
              understand aid offers in plain language, and discover scholarships
              matched to you — all in one calm, simple dashboard.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#waitlist"
                className="rounded-full bg-black px-6 py-3 text-center text-white hover:bg-black/80"
              >
                Get early access
              </a>
              <Link
                href="/dashboard"
                className="rounded-full border border-black/10 px-6 py-3 text-center hover:bg-white"
              >
                See the demo dashboard
              </Link>
            </div>

            <p className="mt-5 text-sm text-black/50">
              Trusted by students who don&apos;t want to lose thousands over one
              missed form, document, or deadline. We never ask for your SSN, tax
              returns, or FAFSA login.
            </p>
          </div>

          <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
            <div className="rounded-[1.5rem] bg-[#f1efe8] p-6">
              <p className="text-sm font-medium text-black/50">This week</p>
              <h2 className="mt-2 text-2xl font-semibold">
                Your aid protection plan
              </h2>

              <div className="mt-6 space-y-3">
                {[
                  "Respond to verification request",
                  "Compare aid offers before committing",
                  "Apply to 3 high-fit scholarships",
                  "Confirm parent FSA ID is active",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl bg-white p-4"
                  >
                    <div className="h-5 w-5 rounded-full border border-black/30" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-black p-5 text-white">
                <p className="text-sm text-white/60">Potential aid at risk</p>
                <p className="mt-1 text-3xl font-semibold">$12,400</p>
                <p className="mt-2 text-sm text-white/60">
                  Stay on track with weekly priorities, checklists, and
                  scholarship matches.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="border-y border-black/10 bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
            One calm place for the money side of college.
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-black/60">
            Financial aid is confusing and high-stakes. AidPilot gives you a clear
            weekly plan so nothing falls through the cracks.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                title: "Protect your aid",
                body: "See what's missing, what's due, and what could put your aid at risk — before it's too late.",
              },
              {
                title: "Avoid FAFSA mistakes",
                body: "Step-by-step checklists for FAFSA, verification, state grants, and school-specific forms.",
              },
              {
                title: "Find scholarships weekly",
                body: "Get a short report of scholarships ranked by fit, deadline, amount, and effort — every week.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-3xl border border-black/10 bg-[#f8f7f3] p-6"
              >
                <h3 className="text-xl font-semibold">{card.title}</h3>
                <p className="mt-3 leading-7 text-black/60">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Built for trust, not hype.
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "No sensitive data",
                body: "We don't collect SSNs, tax documents, or FAFSA passwords.",
              },
              {
                title: "Independent",
                body: "Not affiliated with FAFSA, Federal Student Aid, or any school.",
              },
              {
                title: "Plain language",
                body: "Aid offers and deadlines explained clearly, not in jargon.",
              },
              {
                title: "Weekly rhythm",
                body: "A short plan every week so you always know what to do next.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-black/10 bg-white p-5">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-black/60">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="waitlist" className="border-t border-black/10 px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-4xl font-semibold tracking-tight">
              Join the AidPilot waitlist.
            </h2>
            <p className="mt-4 text-lg leading-8 text-black/60">
              Be among the first students to get a weekly aid protection plan,
              deadline reminders, and scholarship matches — without the stress of
              figuring it all out alone.
            </p>
            <p className="mt-4 text-sm text-black/50">
              Early access is free. We&apos;ll only email you about AidPilot
              launch updates.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm"
          >
            <div className="space-y-4">
              <input
                required
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-black/10 px-4 py-3 outline-none focus:border-black"
              />

              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-2xl border border-black/10 px-4 py-3 outline-none focus:border-black"
              />

              <select
                value={studentType}
                onChange={(e) => setStudentType(e.target.value)}
                className="w-full rounded-2xl border border-black/10 px-4 py-3 outline-none focus:border-black"
              >
                <option value="">I am a...</option>
                <option value="high_school_student">High school student</option>
                <option value="college_student">College student</option>
                <option value="parent">Parent</option>
                <option value="counselor">Counselor</option>
              </select>

              <input
                type="text"
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full rounded-2xl border border-black/10 px-4 py-3 outline-none focus:border-black"
              />

              <textarea
                placeholder="What is the most stressful part of FAFSA, aid, or scholarships?"
                value={biggestPain}
                onChange={(e) => setBiggestPain(e.target.value)}
                className="min-h-28 w-full rounded-2xl border border-black/10 px-4 py-3 outline-none focus:border-black"
              />

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full rounded-full bg-black px-6 py-3 text-white hover:bg-black/80 disabled:opacity-50"
              >
                {status === "loading" ? "Joining..." : "Join waitlist"}
              </button>

              {message && (
                <p
                  className={`text-sm ${
                    status === "success" ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {message}
                </p>
              )}

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs leading-5 text-amber-950">
                  <strong>Important:</strong> AidPilot is an independent service
                  and is not affiliated with FAFSA, Federal Student Aid, the U.S.
                  Department of Education, or any college or university. We
                  provide educational organization and guidance — not legal, tax,
                  or official financial aid advice. We do not collect Social
                  Security numbers, tax documents, FAFSA login credentials, or
                  sensitive financial documents.
                </p>
              </div>

              <p className="text-xs leading-5 text-black/40">
                By joining, you agree to our{" "}
                <Link href="/privacy" className="underline underline-offset-2">
                  Privacy Policy
                </Link>
                . See our{" "}
                <Link href="/disclaimer" className="underline underline-offset-2">
                  Disclaimer
                </Link>{" "}
                for more.
              </p>
            </div>
          </form>
        </div>
      </section>

      <Footer />
    </main>
  );
}
