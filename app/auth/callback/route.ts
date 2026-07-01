import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Only allow same-origin relative paths as the post-login destination - a
// leading-slash path that is NOT protocol-relative ("//host") and has no
// scheme/host. Blocks open-redirect via ?next=//evil.com or ?next=@evil.com.
function safeNext(raw: string | null): string {
  const value = raw ?? "/dashboard";
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return "/dashboard";
  }
  return value;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
