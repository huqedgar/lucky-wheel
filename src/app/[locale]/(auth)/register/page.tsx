import { use } from "react";
import { Locale, useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { RegisterForm } from "@/components/forms/register-form";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { Link } from "@/i18n/navigation";

export default function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale as Locale);
  const t = useTranslations("Metadata");
  const tAuth = useTranslations("Auth");

  return (
    <>
      <div className="hidden px-10 py-5 lg:flex lg:justify-end">
        <div className="text-sm text-muted-foreground">
          {tAuth("hasAccount")}{" "}
          <Link prefetch={false} className="text-foreground" href="login">
            {tAuth("login")}
          </Link>
        </div>
      </div>

      <div className="mx-auto flex w-full flex-1 flex-col items-center justify-center px-4 sm:w-87.5 sm:px-0">
        <div className="w-full space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-medium text-pretty">{tAuth("registerTitle")}</h1>
            <p className="text-sm text-muted-foreground">{tAuth("registerDescription")}</p>
          </div>
          <RegisterForm />
        </div>
        <div className="py-3 text-center text-sm text-muted-foreground lg:hidden">
          {tAuth("hasAccount")}{" "}
          <Link prefetch={false} className="text-foreground" href="login">
            {tAuth("login")}
          </Link>
        </div>
      </div>

      <div className="flex flex-col-reverse items-center gap-2 px-4 py-5 lg:flex-row lg:justify-between lg:px-10">
        <div className="text-center text-sm lg:text-left">{t("copyright")}</div>
        <LocaleSwitcher />
      </div>
    </>
  );
}
