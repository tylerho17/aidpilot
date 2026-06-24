"use client";

import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

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
          <a
            href="#waitlist"
            className="rounded-full border border-black/10 px-5 py-2 text-sm hover:bg-black hover:text-white"
          >
            Join waitlist
          </a>
        </nav>

        <div className="grid flex-1 items-center gap-12 py-20 md:grid-cols-2">
          <div>
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-black/50">
              FAFSA · Aid · Scholarships
            </p>

            <h1 className="text-5xl font-semibold leading-tight tracking-tight md:text-7xl">
              Protect your aid. Find more college money every week.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-black/65">
              AidPilot helps students track FAFSA documents, avoid missed
              financial aid deadlines, understand aid letters, and receive
              weekly scholarship recommendations matched to them.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#waitlist"
                className="rounded-full bg-black px-6 py-3 text-center text-white hover:bg-black/80"
              >
                Get early access
              </a>
              <a
                href="#how"
                className="rounded-full border border-black/10 px-6 py-3 text-center hover:bg-white"
              >
                See how it works
              </a>
            </div>

            <p className="mt-5 text-sm text-black/50">
              Built for students who do not want to lose thousands because of
              one missed form, document, or deadline.
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
                  "Confirm parent FSA ID is created",
                  "Upload your financial aid letter",
                  "Check your state grant deadline",
                  "Apply to 5 matched scholarships",
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
                <p className="mt-1 text-3xl font-semibold">$30,000</p>
                <p className="mt-2 text-sm text-white/60">
                  Stay on track with reminders, documents, and scholarship
                  matches.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="border-y border-black/10 bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
            One dashboard for the money side of college.
          </h2>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                title: "Track FAFSA docs",
                body: "Know exactly what you and your parents need before deadlines hit.",
              },
              {
                title: "Protect your aid",
                body: "Get reminders for missing documents, verification, school deadlines, and renewal tasks.",
              },
              {
                title: "Find scholarships weekly",
                body: "Receive a short report of scholarships ranked by fit, deadline, amount, and effort.",
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

      <section id="waitlist" className="px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-4xl font-semibold tracking-tight">
              Join the AidPilot waitlist.
            </h2>
            <p className="mt-4 text-lg leading-8 text-black/60">
              We are starting with students who want help protecting financial
              aid, tracking FAFSA documents, and finding better scholarships.
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

              <p className="text-xs leading-5 text-black/40">
                AidPilot is not affiliated with the U.S. Department of
                Education, Federal Student Aid, or FAFSA. We provide educational
                organization and guidance, not legal, tax, or official financial
                aid advice.
              </p>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}