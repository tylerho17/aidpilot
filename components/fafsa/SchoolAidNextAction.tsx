import { getSchoolAidNextAction } from "@/lib/fafsa/school-aid-tracker";
import type { UserSchoolAidStatus } from "@/lib/types";

type SchoolAidNextActionProps = {
  status: UserSchoolAidStatus;
};

export default function SchoolAidNextAction({ status }: SchoolAidNextActionProps) {
  const action = getSchoolAidNextAction(status);

  return (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: 12,
        background: "#EAF3FF",
        border: "1px solid #D7E7FB",
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, color: "#0B5CAD", marginBottom: 6 }}>Next action</div>
      <p style={{ fontSize: 14, fontWeight: 500, color: "#374151", margin: 0, lineHeight: 1.6 }}>{action}</p>
    </div>
  );
}
