import { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { AppShell } from "@/components/layouts/app-shell";
import { UserMenu } from "@/components/layouts/user-menu";
import { createClient } from "@/supabase/clients/server";
import { redirect } from "@/i18n/navigation";

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect({ href: "/login", locale: locale as Locale });
  }

  return <AppShell userMenu={<UserMenu />}>{children}</AppShell>;
}
