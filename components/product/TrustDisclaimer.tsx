import { BodyMuted } from "@/components/ui/Typography";
import { layout } from "@/lib/design-tokens";

export default function TrustDisclaimer() {
  return (
    <BodyMuted style={{ marginTop: layout.sectionGap, fontSize: 14 }}>
      AidPilot helps organize financial aid information, but you should confirm final requirements with your
      school&apos;s financial aid office.
    </BodyMuted>
  );
}
