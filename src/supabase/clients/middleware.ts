import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import envConfig from "@/config/app";

/**
 * Creates a Supabase client configured for Next.js middleware.
 *
 * Returns both the client and a mutable response wrapper. The response is
 * reassigned inside `setAll` whenever Supabase refreshes auth cookies, so
 * callers must read `response.value` **after** all auth calls are finished.
 */
export function createMiddlewareClient(request: NextRequest) {
  const responseHolder = {
    value: NextResponse.next({ request }),
  };

  const supabase = createServerClient(
    envConfig.NEXT_PUBLIC_SUPABASE_URL!,
    envConfig.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          responseHolder.value = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            responseHolder.value.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  return { supabase, responseHolder };
}
