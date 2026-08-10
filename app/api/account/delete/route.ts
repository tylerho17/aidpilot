import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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

const DOCUMENT_BUCKET = "student-docs";
const STORAGE_PAGE_SIZE = 100;

function isMissingStorageResource(error: unknown): boolean {
  const maybeError = error as { statusCode?: unknown; status?: unknown; message?: unknown };
  const status = maybeError.statusCode ?? maybeError.status;
  const message = typeof maybeError.message === "string" ? maybeError.message.toLowerCase() : "";
  return status === 404 || message.includes("not found") || message.includes("does not exist");
}

async function deleteVaultFiles(
  admin: ReturnType<typeof createClient>,
  userId: string
): Promise<{ error: unknown | null }> {
  const bucket = admin.storage.from(DOCUMENT_BUCKET);

  for (;;) {
    const { data, error } = await bucket.list(userId, { limit: STORAGE_PAGE_SIZE });
    if (error) {
      return isMissingStorageResource(error) ? { error: null } : { error };
    }

    const files = (data ?? []).filter((item) => item.name && item.id);
    if (files.length === 0) return { error: null };

    const { error: removeError } = await bucket.remove(files.map((item) => `${userId}/${item.name}`));
    if (removeError) return { error: removeError };

    if ((data ?? []).length < STORAGE_PAGE_SIZE) return { error: null };
  }
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
    const { error: vaultDeleteError } = await deleteVaultFiles(admin, user.id);
    if (vaultDeleteError) {
      console.error("Delete account: failed to purge vault storage", vaultDeleteError);
      return NextResponse.json({ error: "Could not delete account. Please contact support." }, { status: 500 });
    }

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
