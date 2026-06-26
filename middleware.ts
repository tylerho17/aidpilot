import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { checkScholarshipAdminServer } from "@/lib/admin-server";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/checklist",
  "/documents",
  "/deadlines",
  "/fafsa",
  "/scholarships",
  "/aid-letter",
  "/settings",
  "/report",
  "/report/scholarships",
];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin");
  const isProtected =
    isAdminRoute ||
    PROTECTED_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (!isProtected) {
    return response;
  }

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute) {
    const isAdmin = await checkScholarshipAdminServer(supabase);
    if (!isAdmin) {
      const deniedUrl = request.nextUrl.clone();
      deniedUrl.pathname = "/dashboard";
      deniedUrl.searchParams.set("admin", "denied");
      return NextResponse.redirect(deniedUrl);
    }
    return response;
  }

  if (pathname !== "/onboarding") {
    const { data: profile } = await supabase
      .from("student_profiles")
      .select("is_onboarded")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.is_onboarded) {
      const onboardingUrl = request.nextUrl.clone();
      onboardingUrl.pathname = "/onboarding";
      return NextResponse.redirect(onboardingUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
