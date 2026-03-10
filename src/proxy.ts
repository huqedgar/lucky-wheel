import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { createMiddlewareClient } from "@/supabase/clients/middleware";
import { locales } from "@/config/app";
import { routing } from "@/i18n/routing";

// =============================================================================
// RBAC — Route-level role protection
// =============================================================================

type SystemRole = "SUPERADMIN" | "ADMIN" | "MANAGER" | "STAFF";

const ROLE_LEVEL: Record<SystemRole, number> = {
  STAFF: 0,
  MANAGER: 1,
  ADMIN: 2,
  SUPERADMIN: 3,
};

/** Protected routes → minimum role required (pathname without locale prefix).
 *  Order matters: specific routes before catch-all `/dashboard`. */
const ROUTE_MIN_ROLE: [string, SystemRole][] = [
  ["/dashboard/audit-logs", "SUPERADMIN"],
  ["/dashboard/system-settings", "SUPERADMIN"],
  ["/dashboard/notification-templates", "ADMIN"],
  ["/dashboard/departments", "ADMIN"],
  ["/dashboard/positions", "ADMIN"],
  ["/dashboard/contract-types", "ADMIN"],
  ["/dashboard/training-categories", "ADMIN"],
  ["/dashboard/participation-types", "ADMIN"],
  ["/dashboard/training-policies", "ADMIN"],
  ["/dashboard/attachments", "ADMIN"],
  ["/dashboard/employees", "MANAGER"],
  ["/dashboard/policy-compliance", "MANAGER"],
  // Catch-all: entire dashboard requires MANAGER minimum
  ["/dashboard", "MANAGER"],
];

function getRequiredRole(pathname: string): SystemRole | null {
  for (const [route, role] of ROUTE_MIN_ROLE) {
    if (pathname === route || pathname.startsWith(route + "/")) {
      return role;
    }
  }
  return null;
}

// =============================================================================
// Middleware
// =============================================================================

const handleI18nRouting = createMiddleware(routing);
const localePrefix = new RegExp(`^/(${locales.join("|")})`);

export default async function proxy(request: NextRequest) {
  // 1. i18n routing
  const i18nResponse = handleI18nRouting(request);

  // Nếu i18n cần redirect (ví dụ /about → /en/about)
  if (i18nResponse.status !== 200) {
    return i18nResponse;
  }

  // 2. Supabase logic
  const { supabase, responseHolder } = createMiddlewareClient(request);

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  const { data, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError) {
    console.error("Auth claims error in middleware:", claimsError.message);
  }

  const user = data?.claims;

  // Strip locale prefix (e.g. /vi/login → /login) to match against auth paths
  const pathname = request.nextUrl.pathname.replace(localePrefix, "");

  const isPublicPath =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/confirm") ||
    pathname.startsWith("/error");

  if (!user && !isPublicPath) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  const isAuthPath = pathname.startsWith("/login") || pathname.startsWith("/register");
  if (user && isAuthPath) {
    const url = request.nextUrl.clone();
    const localeMatch = request.nextUrl.pathname.match(localePrefix);
    const locale = localeMatch ? localeMatch[0] : "";
    url.pathname = `${locale}/`;
    const redirectResponse = NextResponse.redirect(url);
    responseHolder.value.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  }

  // ---------------------------------------------------------------------------
  // 3. Role-based route protection
  // ---------------------------------------------------------------------------
  if (user) {
    const requiredRole = getRequiredRole(pathname);

    if (requiredRole) {
      const { data: employee } = await supabase
        .from("employees")
        .select("system_role")
        .eq("auth_id", user.sub)
        .is("deleted_at", null)
        .single();

      const userRole = (employee?.system_role as SystemRole) ?? "STAFF";

      if (ROLE_LEVEL[userRole] < ROLE_LEVEL[requiredRole]) {
        const url = request.nextUrl.clone();
        const localeMatch = request.nextUrl.pathname.match(localePrefix);
        const locale = localeMatch ? localeMatch[0] : "";
        url.pathname = `${locale}/`;
        const redirectResponse = NextResponse.redirect(url);
        responseHolder.value.cookies.getAll().forEach((cookie) => {
          redirectResponse.cookies.set(cookie.name, cookie.value);
        });
        return redirectResponse;
      }
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // 4. Merge i18n headers vào supabaseResponse
  i18nResponse.headers.forEach((value, key) => {
    responseHolder.value.headers.set(key, value);
  });

  return responseHolder.value;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
