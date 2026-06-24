import Link from "next/link";
import type { Metadata } from "next";
import {
  aidStatus,
  checklistItems,
  missingDocuments,
  scholarshipItems,
  upcomingDeadlines,
  weeklyPriorities,
  type ChecklistStatus,
} from "@/lib/dashboard-data";

export const metadata: Metadata = {
  title: "Dashboard — AidPilot",
  description: "Demo dashboard for tracking financial aid, deadlines, and scholarships.",
};

function StatusBadge({ status }: { status: ChecklistStatus }) {
  const styles = {
    done: "bg-green-100 text-green-800",
    in_progress: "bg-amber-100 text-amber-800",
    todo: "bg-black/5 text-black/50",
  };
  const labels = {
    done: "Done",
    in_progress: "In progress",
    todo: "To do",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function UrgencyDot({ urgency }: { urgency: "high" | "medium" | "low" }) {
  const colors = {
    high: "bg-red-500",
    medium: "bg-amber-500",
    low: "bg-green-500",
  };
  return <span className={`inline-block h-2 w-2 rounded-full ${colors[urgency]}`} />;
}

export default function DashboardPage() {
  const completedCount = checklistItems.filter((i) => i.status === "done").length;

  return (
    <main className="min-h-screen bg-[#f8f7f3] text-[#171717]">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-semibold tracking-tight">
              AidPilot
            </Link>
            <span className="hidden rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 sm:inline">
              Demo — sample data only
            </span>
          </div>
          <Link
            href="/"
            className="text-sm text-black/50 hover:text-black"
          >
            Back to home
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Your aid dashboard</h1>
          <p className="mt-2 text-black/60">
            Week of June 23, 2026 · Sample student profile
          </p>
        </div>

        {/* Aid status summary */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <p className="text-sm text-black/50">Aid status</p>
            <p className="mt-1 text-lg font-semibold">{aidStatus.overall}</p>
            <p className="mt-1 text-sm text-black/50">{aidStatus.fafsaStatus}</p>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <p className="text-sm text-black/50">Aid at risk</p>
            <p className="mt-1 text-2xl font-semibold">
              ${aidStatus.aidAtRisk.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-black/50">If deadlines are missed</p>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <p className="text-sm text-black/50">Checklist progress</p>
            <p className="mt-1 text-2xl font-semibold">
              {completedCount}/{aidStatus.tasksTotal}
            </p>
            <p className="mt-1 text-sm text-black/50">Tasks complete</p>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <p className="text-sm text-black/50">Scholarships matched</p>
            <p className="mt-1 text-2xl font-semibold">{aidStatus.scholarshipsMatched}</p>
            <p className="mt-1 text-sm text-black/50">This week&apos;s report</p>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {/* This week's priorities */}
            <section className="rounded-2xl border border-black/10 bg-white p-6">
              <h2 className="text-lg font-semibold">This week&apos;s priorities</h2>
              <p className="mt-1 text-sm text-black/50">
                Focus on these first · Next review {aidStatus.nextReview}
              </p>
              <div className="mt-5 space-y-3">
                {weeklyPriorities.map((priority) => (
                  <div
                    key={priority.id}
                    className="flex gap-3 rounded-xl border border-black/5 bg-[#f8f7f3] p-4"
                  >
                    <div className="mt-1.5">
                      <UrgencyDot urgency={priority.urgency} />
                    </div>
                    <div>
                      <p className="font-medium">{priority.title}</p>
                      <p className="mt-1 text-sm text-black/60">{priority.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Aid checklist */}
            <section className="rounded-2xl border border-black/10 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Aid checklist</h2>
                  <p className="mt-1 text-sm text-black/50">
                    {completedCount} of {checklistItems.length} tasks complete
                  </p>
                </div>
              </div>
              <div className="mt-5 divide-y divide-black/5">
                {checklistItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`h-4 w-4 shrink-0 rounded-full border-2 ${
                          item.status === "done"
                            ? "border-green-600 bg-green-600"
                            : "border-black/20"
                        }`}
                      />
                      <div className="min-w-0">
                        <p
                          className={`text-sm ${
                            item.status === "done" ? "text-black/40 line-through" : ""
                          }`}
                        >
                          {item.task}
                        </p>
                        <p className="text-xs text-black/40">{item.category}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {item.dueDate && (
                        <span className="text-xs text-black/40">{item.dueDate}</span>
                      )}
                      <StatusBadge status={item.status} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Weekly scholarship report */}
            <section className="rounded-2xl border border-black/10 bg-white p-6">
              <h2 className="text-lg font-semibold">Weekly scholarship report</h2>
              <p className="mt-1 text-sm text-black/50">
                {scholarshipItems.length} opportunities ranked by fit, deadline, and effort
              </p>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-black/10 text-left text-black/50">
                      <th className="pb-3 pr-4 font-medium">Scholarship</th>
                      <th className="pb-3 pr-4 font-medium">Amount</th>
                      <th className="pb-3 pr-4 font-medium">Deadline</th>
                      <th className="pb-3 pr-4 font-medium">Effort</th>
                      <th className="pb-3 font-medium">Fit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {scholarshipItems.map((scholarship) => (
                      <tr key={scholarship.id}>
                        <td className="py-3 pr-4">
                          <p className="font-medium">{scholarship.name}</p>
                          <p className="text-xs text-black/40">{scholarship.category}</p>
                        </td>
                        <td className="py-3 pr-4">{scholarship.amount}</td>
                        <td className="py-3 pr-4">{scholarship.deadline}</td>
                        <td className="py-3 pr-4">{scholarship.effort}</td>
                        <td className="py-3">
                          <span className="rounded-full bg-black px-2 py-0.5 text-xs text-white">
                            {scholarship.fit}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            {/* Missing documents */}
            <section className="rounded-2xl border border-black/10 bg-white p-6">
              <h2 className="text-lg font-semibold">Missing documents</h2>
              <p className="mt-1 text-sm text-black/50">
                {missingDocuments.length} items need attention
              </p>
              <div className="mt-5 space-y-3">
                {missingDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="rounded-xl border border-red-100 bg-red-50 p-4"
                  >
                    <p className="font-medium text-red-950">{doc.name}</p>
                    <p className="mt-1 text-sm text-red-900/70">{doc.requestedBy}</p>
                    <p className="mt-2 text-xs font-medium text-red-800">
                      Due {doc.dueDate}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs leading-5 text-black/40">
                AidPilot does not collect tax documents or SSNs. Track what&apos;s
                needed and submit directly to your school.
              </p>
            </section>

            {/* Upcoming deadlines */}
            <section className="rounded-2xl border border-black/10 bg-white p-6">
              <h2 className="text-lg font-semibold">Upcoming deadlines</h2>
              <div className="mt-5 space-y-3">
                {upcomingDeadlines.map((deadline) => (
                  <div
                    key={deadline.id}
                    className="flex items-start gap-3 rounded-xl border border-black/5 p-4"
                  >
                    <div className="mt-1">
                      <UrgencyDot urgency={deadline.urgency} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{deadline.title}</p>
                      <p className="mt-0.5 text-xs text-black/50">
                        {deadline.date} · {deadline.type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="rounded-2xl border border-black/10 bg-[#f1efe8] p-5 text-sm leading-6 text-black/60">
              <p className="font-medium text-black">Demo only</p>
              <p className="mt-2">
                This dashboard uses sample data. Join the waitlist on the home page
                for early access to your real aid plan.
              </p>
              <Link
                href="/#waitlist"
                className="mt-4 inline-block rounded-full bg-black px-4 py-2 text-sm text-white hover:bg-black/80"
              >
                Join waitlist
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-xs leading-5 text-black/40">
          AidPilot is independent and not affiliated with FAFSA, Federal Student Aid,
          the Department of Education, or any college.{" "}
          <Link href="/disclaimer" className="underline underline-offset-2">
            Read disclaimer
          </Link>
        </p>
      </div>
    </main>
  );
}
