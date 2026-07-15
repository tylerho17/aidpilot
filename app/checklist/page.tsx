import { redirect } from "next/navigation";

// The weekly check-in folded into the Dashboard.
export default function ChecklistPage() {
  redirect("/dashboard");
}
