import { redirect } from "next/navigation";

// Documents now live in the Docs & Dates surface (reached from the Dashboard).
export default function DocumentsPage() {
  redirect("/docs-dates");
}
