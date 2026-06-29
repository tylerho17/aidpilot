import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const USER_TABLES = [
  "scholarship_matches",
  "aid_recommendations",
  "weekly_reports",
  "aid_letters",
  "deadlines",
  "document_items",
  "aid_tasks",
  "user_fafsa_steps",
  "fafsa_step_progress",
  "student_profiles",
] as const;

export async function POST() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "You must be logged in to delete your account." }, { status: 401 });
  }

  if (!serviceKey) {
    return NextResponse.json(
      {
        error:
          "Account deletion is not fully configured on this deployment. Email privacy@aidpilot.app to request deletion.",
        requestOnly: true,
      },
      { status: 503 }
    );
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    for (const table of USER_TABLES) {
      const { error } = await admin.from(table).delete().eq(table === "student_profiles" ? "id" : "user_id", user.id);
      if (error) {
        console.error(`Delete account: failed on ${table}`, error);
      }
    }

    const { error: deleteUserError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteUserError) {
      return NextResponse.json({ error: deleteUserError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete account failed:", err);
    return NextResponse.json({ error: "Could not delete account. Please contact support." }, { status: 500 });
  }
}
