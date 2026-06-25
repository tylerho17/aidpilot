import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { PillBadge, ProductCard, ProgressBar, StatCard } from "@/components/ProductUI";
import {
  CHECKLIST_TASKS,
  DOCUMENTS,
  documentStatusToTone,
  getAttentionCount,
  getChecklistProgress,
  getMissingDocumentCount,
  getNextDeadline,
  statusToTone,
  type ChecklistTask,
  type TaskStatus,
} from "@/lib/demo-data";

const STATUS_ORDER: Record<TaskStatus, number> = {
  Missing: 0,
  "Due Soon": 1,
  "Needs Review": 2,
  Optional: 3,
  Upcoming: 4,
  Complete: 5,
};

const CATEGORIES = [...new Set(CHECKLIST_TASKS.map((t) => t.category))];

function sortTasks(tasks: ChecklistTask[]) {
  return [...tasks].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
}

export default function ChecklistPage() {
  const progress = getChecklistProgress();
  const attention = getAttentionCount();
  const missingDocs = getMissingDocumentCount();
  const sorted = sortTasks(CHECKLIST_TASKS);

  return (
    <AppShell>
      <div style={{ marginBottom: 32 }}>
        <h1 className="font-display" style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 10px", color: "#15212E", lineHeight: 1.1 }}>
          Aid Checklist
        </h1>
        <p style={{ fontSize: 17, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
          Track every step needed to protect your financial aid. {CHECKLIST_TASKS.length} tasks for Maya&apos;s aid cycle.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 28 }}>
        <StatCard label="Progress" value={`${progress}% complete`} color="#0B5CAD" style={{ flex: "1 1 140px" }} />
        <StatCard label="Tasks" value={`${attention} need attention`} color="#B7791F" style={{ flex: "1 1 140px" }} />
        <StatCard label="Documents" value={`${missingDocs} missing`} color="#C04E57" style={{ flex: "1 1 140px" }} />
        <StatCard label="Next deadline" value={getNextDeadline()} color="#B7791F" style={{ flex: "1 1 140px" }} />
      </div>

      <ProductCard style={{ padding: 24, marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span className="font-display" style={{ fontSize: 18, fontWeight: 800, color: "#15212E" }}>
            Overall progress
          </span>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#0B5CAD" }}>{progress}%</span>
        </div>
        <ProgressBar pct={progress} color="linear-gradient(90deg,#15885A,#37A877)" />
        <p style={{ fontSize: 14, fontWeight: 700, color: "#15885A", margin: "14px 0 0" }}>
          Nice work, Maya. You are {progress}% done with your aid checklist.
        </p>
      </ProductCard>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {CATEGORIES.map((cat) => {
          const count = CHECKLIST_TASKS.filter((t) => t.category === cat).length;
          const done = CHECKLIST_TASKS.filter((t) => t.category === cat && t.status === "Complete").length;
          return (
            <span
              key={cat}
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#0B5CAD",
                background: "#EAF3FF",
                padding: "6px 12px",
                borderRadius: 999,
              }}
            >
              {cat} · {done}/{count}
            </span>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.15fr .85fr", gap: 22, alignItems: "start" }}>
        <ProductCard style={{ padding: 26 }}>
          <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 6px", color: "#15212E" }}>
            All checklist tasks
          </h2>
          <p style={{ fontSize: 13, fontWeight: 500, color: "#9AA4B2", margin: "0 0 18px" }}>
            Sorted by urgency. Complete tasks are at the bottom.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sorted.map((item) => (
              <div
                key={item.id}
                className="card-lift"
                style={{
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: "1px solid #EAEEF3",
                  background: item.status === "Complete" ? "#F5FBF7" : "#fff",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: item.status === "Complete" ? "#7C9A89" : "#15212E",
                      textDecoration: item.status === "Complete" ? "line-through" : "none",
                    }}
                  >
                    {item.title}
                  </div>
                  <PillBadge tone={statusToTone(item.status)}>{item.status}</PillBadge>
                </div>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#6B7280", margin: "0 0 8px", lineHeight: 1.55 }}>{item.description}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: "#9AA4B2" }}>{item.category}</span>
                  <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#CBD2DA" }} />
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: "#9AA4B2" }}>Due {item.dueDate}</span>
                  <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#CBD2DA" }} />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: item.priority === "High" ? "#C04E57" : item.priority === "Medium" ? "#B7791F" : "#9AA4B2",
                    }}
                  >
                    {item.priority} priority
                  </span>
                </div>
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
                  key={doc.id}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: "#F9FAFB",
                    border: "1px solid #EAEEF3",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#15212E" }}>{doc.name}</span>
                    <PillBadge tone={documentStatusToTone(doc.status)}>{doc.status}</PillBadge>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#9AA4B2" }}>Due {doc.dueDate}</div>
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
                  Upload your parent tax return and non-filing letter by July 20 to avoid aid delays.
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
