import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const DOCUMENT_BUCKET = "student-docs";
const USER_TABLES = [
  "scholarship_matches",
  "aid_recommendations",
  "weekly_reports",
  "aid_letters",
  "user_aid_offers",
  "deadlines",
  "document_items",
  "aid_tasks",
  "user_fafsa_steps",
  "fafsa_step_progress",
  "user_school_aid_tasks",
  "user_school_aid_statuses",
  "user_scholarship_matches",
  "student_profiles",
] as const;

function isMissingBucketError(error: unknown): boolean {
  const maybe = error as { statusCode?: string | number; message?: string; error?: string } | null;
  const message = `${maybe?.message ?? ""} ${maybe?.error ?? ""}`;
  return /bucket.*not found|not found.*bucket/i.test(message);
}

async function deleteDocumentVaultFiles(admin: SupabaseClient, userId: string): Promise<void> {
  const bucket = admin.storage.from(DOCUMENT_BUCKET);
  const paths: string[] = [];
  let offset = 0;
  const limit = 100;

  for (;;) {
    const { data, error } = await bucket.list(userId, { limit, offset });
    if (error) {
      if (isMissingBucketError(error)) return;
      throw error;
    }

    const page = data ?? [];
    paths.push(...page.filter((item) => item.name && item.id).map((item) => `${userId}/${item.name}`));
    if (page.length < limit) break;
    offset += page.length;
  }

  if (paths.length === 0) return;
  const { error } = await bucket.remove(paths);
  if (error) throw error;
}

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
    await deleteDocumentVaultFiles(admin, user.id);

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
