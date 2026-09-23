import { createClient } from "@/lib/supabase/client";

/**
 * Client helpers for the private student-docs bucket (migration 029). Every path
 * is namespaced under the user's id (`{userId}/...`), which the storage RLS
 * enforces, so a student can only touch their own files. Files are read through
 * short-lived signed URLs, never public links.
 */

export const BUCKET = "student-docs";
export const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/heic"];
export const ALLOWED_LABEL = "PDF, PNG, JPG, or HEIC/HEIF · up to 10 MB";

export type StoredDoc = { name: string; label: string; path: string; size: number; createdAt: string };

/** Strip our `{timestamp}-` prefix to show the original filename. */
function prettyName(name: string): string {
  return name.replace(/^\d+-/, "");
}

export async function listDocs(userId: string): Promise<StoredDoc[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(userId, { sortBy: { column: "created_at", order: "desc" } });
    if (error || !data) return [];
    return data
      .filter((f) => f.name && f.id)
      .map((f) => ({
        name: f.name,
        label: prettyName(f.name),
        path: `${userId}/${f.name}`,
        size: (f.metadata?.size as number) ?? 0,
        createdAt: f.created_at ?? "",
      }));
  } catch {
    return [];
  }
}

export type UploadResult = { ok: true } | { ok: false; reason: "too_big" | "bad_type" | "failed" };

function uploadContentType(file: File): string | null {
  const type = file.type.toLowerCase();
  if (ALLOWED_TYPES.includes(type)) return type;

  const isHeicName = /\.(heic|heif)$/i.test(file.name);
  if (isHeicName && (type === "" || type === "application/octet-stream" || type === "image/heif")) {
    return "image/heic";
  }

  return null;
}

export async function uploadDoc(userId: string, file: File): Promise<UploadResult> {
  if (file.size > MAX_BYTES) return { ok: false, reason: "too_big" };
  const contentType = uploadContentType(file);
  if (!contentType) return { ok: false, reason: "bad_type" };
  try {
    const supabase = createClient();
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "document";
    const path = `${userId}/${Date.now()}-${safe}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false, contentType });
    return error ? { ok: false, reason: "failed" } : { ok: true };
  } catch {
    return { ok: false, reason: "failed" };
  }
}

export async function removeDoc(path: string): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.storage.from(BUCKET).remove([path]);
  } catch {
    /* best-effort */
  }
}

export async function signedUrl(path: string): Promise<string | null> {
  try {
    const supabase = createClient();
    const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60);
    return data?.signedUrl ?? null;
  } catch {
    return null;
  }
}

export function formatBytes(bytes: number): string {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
