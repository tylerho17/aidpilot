import { redirect } from "next/navigation";

// Deadlines now live in the Docs & Dates surface (reached from the Dashboard).
export default function DeadlinesPage() {
  redirect("/docs-dates");
}
