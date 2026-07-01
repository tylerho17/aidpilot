import { StatusPanel } from "@/components/ui";
import { getSchoolAidNextAction } from "@/lib/fafsa/school-aid-tracker";
import type { UserSchoolAidStatus } from "@/lib/types";

type SchoolAidNextActionProps = {
  status: UserSchoolAidStatus;
};

export default function SchoolAidNextAction({ status }: SchoolAidNextActionProps) {
  const action = getSchoolAidNextAction(status);

  return (
    <StatusPanel tone="blue" icon="clipboard" eyebrow="Next action" style={{ borderRadius: "var(--radius-2xl)" }}>
      {action}
    </StatusPanel>
  );
}
