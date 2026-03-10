import { use } from "react";
import { Locale, useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { IconAlertTriangle } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale as Locale);
  const t = useTranslations("ErrorPage");

  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <div className="mx-auto flex max-w-sm flex-col items-center space-y-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
          <IconAlertTriangle className="size-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-medium">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" nativeButton={false} render={<Link href="/" />}>
            {t("backToHome")}
          </Button>
          <Button nativeButton={false} render={<Link href="/login" />}>
            {t("backToLogin")}
          </Button>
        </div>
      </div>
    </main>
  );
}
