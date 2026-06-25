import Link from "next/link";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { CheckSVG, PillBadge, ProductCard, StatCard } from "@/components/ProductUI";

export const metadata: Metadata = {
  title: "Dashboard | AidPilot",
  description: "Maya Chen's weekly aid check-in.",
};

const PRIORITIES = [
  { task: "Upload 2024 tax return", status: "Missing", due: "Due July 18", tone: "coral" as const },
  { task: "Submit FAFSA correction", status: "Due Soon", due: "Due July 15", tone: "amber" as const },
  { task: "Verify enrollment status", status: "Needs Review", due: "Due July 22", tone: "blue" as const },
];

export default function DashboardPage() {
  return (
    <AppShell>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#9AA4B2", margin: "0 0 6px" }}>Good morning, Maya.</p>
        <h1 className="font-display" style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 10px", color: "#15212E", lineHeight: 1.1 }}>
          Your aid is protected this week.
        </h1>
        <p style={{ fontSize: 17, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
          2 tasks need attention before July 15. AidPilot is watching the rest.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 28 }}>
        <StatCard label="Aid Status" value="Protected" color="#15885A" style={{ flex: "1 1 140px" }} />
        <StatCard label="Aid at Risk" value="$2,400" color="#C04E57" style={{ flex: "1 1 140px" }} sub="If deadlines are missed" />
        <StatCard label="Checklist Progress" value="7 of 10" color="#0B5CAD" style={{ flex: "1 1 140px" }} />
        <StatCard label="Next Deadline" value="July 15" color="#B7791F" style={{ flex: "1 1 140px" }} />
        <StatCard label="Scholarships" value="12 new matches" color="#0B5CAD" style={{ flex: "1 1 160px" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr .8fr", gap: 22, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <ProductCard style={{ padding: 28, background: "linear-gradient(135deg,#EAFBF1,#F4FBF7)", border: "1px solid #D5F0E2" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ display: "flex", width: 24, height: 24, borderRadius: "50%", background: "#15885A", alignItems: "center", justifyContent: "center" }}>
                <CheckSVG size={13} strokeWidth={2.6} />
              </span>
              <PillBadge tone="green">Protected this week</PillBadge>
            </div>
            <h2 className="font-display" style={{ fontSize: 24, fontWeight: 900, margin: "0 0 10px", color: "#15212E", lineHeight: 1.25 }}>
              Your aid is safe this week.
            </h2>
            <p style={{ fontSize: 15.5, fontWeight: 500, color: "#5B6573", margin: "0 0 22px", lineHeight: 1.65 }}>
              AidPilot is watching your eligibility, enrollment, documents, and deadlines. Two small tasks need attention before July 15.
            </p>
            <Link
              href="/checklist"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 15,
                fontWeight: 700,
                color: "#fff",
                background: "#15885A",
                padding: "12px 22px",
                borderRadius: 13,
                textDecoration: "none",
                boxShadow: "0 10px 20px rgba(21,136,90,.22)",
              }}
            >
              Review tasks
            </Link>
          </ProductCard>

          <ProductCard style={{ padding: 26 }}>
            <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 18px", color: "#15212E" }}>
              What needs attention
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {PRIORITIES.map((row) => (
                <div
                  key={row.task}
                  className="animate-slide-in"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    padding: "14px 16px",
                    borderRadius: 14,
                    background: "#F9FAFB",
                    border: "1px solid #EAEEF3",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#15212E", marginBottom: 4 }}>{row.task}</div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "#9AA4B2" }}>{row.due}</div>
                  </div>
                  <PillBadge tone={row.tone}>{row.status}</PillBadge>
                </div>
              ))}
            </div>
          </ProductCard>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div className="animate-toast-in" style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "1px solid #F0E6CC", borderRadius: 14, boxShadow: "0 14px 28px -12px rgba(183,121,31,.22)", padding: "12px 14px" }}>
            <span style={{ display: "flex", width: 30, height: 30, borderRadius: 9, background: "#FFF7E6", alignItems: "center", justifyContent: "center" }}>
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#B7791F" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.7 21a2 2 0 0 1-3.4 0" />
              </svg>
            </span>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#15212E" }}>Deadline caught</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#9AA4B2" }}>Cal Grant, 8 days left</div>
            </div>
          </div>

          <ProductCard style={{ padding: 26, background: "linear-gradient(135deg,#EAF3FF,#F4F8FE)", border: "1px solid #D7E7FB" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{ display: "flex", width: 42, height: 42, borderRadius: 12, background: "#fff", alignItems: "center", justifyContent: "center" }}>
                <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#0B5CAD" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l2.4 5.3L20 9l-4 4 1 6-5-2.8L7 19l1-6-4-4 5.6-.7L12 3Z" />
                </svg>
              </span>
              <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: 0, color: "#15212E" }}>
                We found money for you this week.
              </h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
              {[
                { label: "12 new matches", color: "#0B5CAD" },
                { label: "$24,500 potential awards", color: "#15885A" },
                { label: "4 strong matches", color: "#0B5CAD" },
              ].map((s) => (
                <div key={s.label} className="font-display" style={{ fontSize: 22, fontWeight: 900, color: s.color }}>
                  {s.label}
                </div>
              ))}
            </div>
            <Link
              href="/scholarships"
              style={{
                display: "inline-flex",
                fontSize: 15,
                fontWeight: 700,
                color: "#fff",
                background: "#0B5CAD",
                padding: "12px 22px",
                borderRadius: 13,
                textDecoration: "none",
                boxShadow: "0 10px 20px rgba(11,92,173,.22)",
              }}
            >
              View scholarship report
            </Link>
          </ProductCard>
        </div>
      </div>

      <p style={{ marginTop: 36, fontSize: 12, color: "#9AA4B2", lineHeight: 1.6 }}>
        Demo data for Maya Chen, sample student persona. AidPilot is independent and not affiliated with FAFSA, Federal Student Aid, or any school.{" "}
        <Link href="/disclaimer" style={{ color: "#0B5CAD", textDecoration: "underline" }}>
          Read disclaimer
        </Link>
      </p>
    </AppShell>
  );
}
