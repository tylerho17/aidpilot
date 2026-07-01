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
  "/aid-money",
  "/docs-dates",
  "/settings",
  "/report",
  "/report/scholarships",
];

// Design IA consolidates 9 destinations into 4 tabs. Old top-level routes
// redirect to their merged tab (sub-routes like /aid-letter/compare stay).
const MERGED_REDIRECTS: Record<string, string> = {
  "/scholarships": "/aid-money",
  "/aid-letter": "/aid-money",
  "/documents": "/docs-dates",
  "/deadlines": "/docs-dates",
  "/protect": "/dashboard",
  // Old standalone destinations the design's 4-tab IA folds into a tab:
  "/checklist": "/dashboard",
  "/actions": "/dashboard",
  "/report": "/dashboard",
  "/report/scholarships": "/aid-money",
};

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

  // Enforce HTTPS on all served pages (harmless over http in local dev).
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");

  const pathname = request.nextUrl.pathname;

  const mergedTarget = MERGED_REDIRECTS[pathname];
  if (mergedTarget) {
    const to = request.nextUrl.clone();
    to.pathname = mergedTarget;
    to.search = "";
    return NextResponse.redirect(to);
  }

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
