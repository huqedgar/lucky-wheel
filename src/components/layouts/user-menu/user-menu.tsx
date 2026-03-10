import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { signOut } from "@/actions/auth.actions";
import { createClient } from "@/supabase/clients/server";
import { Link } from "@/i18n/navigation";
import { UserMenuClient } from "./user-menu-client";

export async function UserMenu() {
  const supabase = await createClient();
  const t = await getTranslations("Auth");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/login" />}>
        {t("login")}
      </Button>
    );
  }

  return (
    <UserMenuClient
      user={{
        email: user.email ?? "",
        name: user.user_metadata?.full_name,
        avatar: user.user_metadata?.avatar_url,
      }}
      signOutAction={signOut}
    />
  );
}
