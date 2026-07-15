import { redirect } from "next/navigation";

// Aid actions surface as the "Do this next" card on Protect and the Dashboard.
export default function ActionsPage() {
  redirect("/protect");
}
