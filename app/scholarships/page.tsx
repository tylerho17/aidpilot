import type { Metadata } from "next";
import { AppChrome } from "@/components/app/AppChrome";
import { ComingSoonScreen } from "@/components/app/ComingSoonScreen";

export const metadata: Metadata = {
  title: "Scholarships | AidPilot",
  description: "The scholarship tracker is coming soon.",
};

export default function ScholarshipsPage() {
  return (
    <AppChrome>
      <ComingSoonScreen
        icon="star"
        title={{ en: "Scholarship tracker", es: "Rastreador de becas" }}
        description={{
          en: "Weekly scholarship matches, deadlines, and application tracking - matched to your profile.",
          es: "Becas compatibles cada semana, fechas límite y seguimiento de solicitudes - según tu perfil.",
        }}
      />
    </AppChrome>
  );
}
