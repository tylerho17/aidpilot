import type { Metadata } from "next";
import { AppChrome } from "@/components/app/AppChrome";
import { TasksScreen } from "@/components/app/screens/TasksScreen";

export const metadata: Metadata = {
  title: "Docs & Dates | AidPilot",
  description: "Every deadline and document in one place - caught early.",
};

export default function DocsDatesPage() {
  return (
    <AppChrome>
      <TasksScreen />
    </AppChrome>
  );
}
