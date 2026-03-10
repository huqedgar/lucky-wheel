import { type NextRequest } from "next/server";
import { Locale } from "next-intl";
import { type EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/supabase/clients/server";
import { redirect } from "@/i18n/navigation";

const VALID_OTP_TYPES: EmailOtpType[] = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
];

function isSafeRedirectPath(path: string): boolean {
  return (
    path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/\\") && !path.includes(":")
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/";

  if (token_hash && type && VALID_OTP_TYPES.includes(type as EmailOtpType)) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash,
    });
    if (!error) {
      // For password recovery, redirect to reset-password page
      if (type === "recovery") {
        redirect({ href: "/reset-password", locale: locale as Locale });
      }

      redirect({
        href: isSafeRedirectPath(next) ? next : "/",
        locale: locale as Locale,
      });
    }
  }

  redirect({ href: "/error", locale: locale as Locale });
}
