import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { PillBadge, ProductCard, ProgressBar, StatCard } from "@/components/ProductUI";

type TaskTone = "green" | "amber" | "coral" | "blue" | "gray";

const TASKS: { task: string; status: string; due: string; tone: TaskTone }[] = [
  { task: "Submit FAFSA correction", status: "Due Soon", due: "July 15", tone: "amber" },
  { task: "Upload parent tax return", status: "Missing", due: "July 18", tone: "coral" },
  { task: "Verify enrollment status", status: "Needs Review", due: "July 22", tone: "blue" },
  { task: "Review aid offer", status: "Complete", due: "Done", tone: "green" },
  { task: "Accept work-study", status: "Optional", due: "Aug 1", tone: "gray" },
];

const DOCUMENTS: { name: string; status: string; tone: TaskTone }[] = [
  { name: "Parent tax return", status: "Missing", tone: "coral" },
  { name: "Proof of enrollment", status: "Uploaded", tone: "green" },
  { name: "Student ID", status: "Uploaded", tone: "green" },
  { name: "Dependency form", status: "Needs Review", tone: "blue" },
  { name: "Cal Grant verification", status: "Uploaded", tone: "green" },
];

export default function ChecklistPage() {
  return (
    <AppShell>
      <div style={{ marginBottom: 32 }}>
        <h1 className="font-display" style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 10px", color: "#15212E", lineHeight: 1.1 }}>
          Aid Checklist
        </h1>
        <p style={{ fontSize: 17, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
          Track every step needed to protect your financial aid.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 28 }}>
        <StatCard label="Progress" value="70% complete" color="#0B5CAD" style={{ flex: "1 1 140px" }} />
        <StatCard label="Tasks" value="3 need attention" color="#B7791F" style={{ flex: "1 1 140px" }} />
        <StatCard label="Documents" value="2 missing" color="#C04E57" style={{ flex: "1 1 140px" }} />
        <StatCard label="Next deadline" value="July 15" color="#B7791F" style={{ flex: "1 1 140px" }} />
      </div>

      <ProductCard style={{ padding: 24, marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span className="font-display" style={{ fontSize: 18, fontWeight: 800, color: "#15212E" }}>
            Overall progress
          </span>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#0B5CAD" }}>70%</span>
        </div>
        <ProgressBar pct={70} />
        <p style={{ fontSize: 14, fontWeight: 700, color: "#15885A", margin: "14px 0 0" }}>
          Nice work, Maya. You are 70% done.
        </p>
      </ProductCard>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 22, alignItems: "start" }}>
        <ProductCard style={{ padding: 26 }}>
          <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 18px", color: "#15212E" }}>
            Checklist tasks
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {TASKS.map((item) => (
              <div
                key={item.task}
                className="card-lift animate-slide-in"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 14,
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: "1px solid #EAEEF3",
                  background: item.status === "Complete" ? "#F5FBF7" : "#fff",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: item.status === "Complete" ? "#7C9A89" : "#15212E",
                      textDecoration: item.status === "Complete" ? "line-through" : "none",
                      marginBottom: 4,
                    }}
                  >
                    {item.task}
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "#9AA4B2" }}>{item.due}</div>
                </div>
                <PillBadge tone={item.tone}>{item.status}</PillBadge>
              </div>
            ))}
          </div>
        </ProductCard>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <ProductCard style={{ padding: 26 }}>
            <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 6px", color: "#15212E" }}>
              Document tracker
            </h2>
            <p style={{ fontSize: 13, fontWeight: 500, color: "#9AA4B2", margin: "0 0 16px", lineHeight: 1.5 }}>
              Status only. No uploads in this demo.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {DOCUMENTS.map((doc) => (
                <div
                  key={doc.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: "#F9FAFB",
                    border: "1px solid #EAEEF3",
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#15212E" }}>{doc.name}</span>
                  <PillBadge tone={doc.tone}>{doc.status}</PillBadge>
                </div>
              ))}
            </div>
          </ProductCard>

          <ProductCard style={{ padding: 22, background: "#FFF7E6", border: "1px solid #F2E6C8" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ display: "flex", width: 32, height: 32, borderRadius: 9, background: "#FFE4E6", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#C04E57" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 9v4M12 17h.01" />
                  <path d="M10.3 4.3h3.4L20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9l5.7-4.7Z" />
                </svg>
              </span>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#92600A", margin: "0 0 6px" }}>Action needed</p>
                <p style={{ fontSize: 14, fontWeight: 500, color: "#78350F", margin: 0, lineHeight: 1.6 }}>
                  Upload your parent tax return by July 18 to avoid aid delays.
                </p>
              </div>
            </div>
          </ProductCard>

          <Link
            href="/dashboard"
            style={{
              display: "block",
              textAlign: "center",
              fontSize: 14,
              fontWeight: 700,
              color: "#0B5CAD",
              background: "#fff",
              border: "1.5px solid #DCE7F5",
              padding: 14,
              borderRadius: 14,
              textDecoration: "none",
            }}
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
