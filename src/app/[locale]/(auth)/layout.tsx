import { use } from "react";
import Image from "next/image";
import { Locale, useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Separator } from "@/components/ui/separator";

export default function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale as Locale);
  const t = useTranslations("Metadata");
  const tLayout = useTranslations("AuthLayout");

  return (
    <main className="grid h-dvh justify-center p-2 lg:grid-cols-2">
      <div className="relative order-2 hidden h-full overflow-hidden rounded-3xl bg-primary lg:flex">
        <Image
          src="/images/bth-bg-1.webp"
          alt=""
          fill
          sizes="50vw"
          className="object-cover"
          priority
        />
        <div className="absolute top-10 space-y-1 px-10 text-primary-foreground">
          <Image src="/svgs/bth-logo-1.svg" width={62} height={40} alt="logo" loading="eager" />
          <p className="text-2xl font-extrabold text-bth-primary uppercase">{t("hospitalName")}</p>
          <p className="text-sm font-bold text-bth-secondary uppercase">{tLayout("tagline")}</p>
        </div>
        <div className="absolute bottom-10 flex w-full justify-between px-10">
          <div className="flex-1 space-y-1 text-primary-foreground">
            <p className="font-medium">{tLayout("readyTitle")}</p>
            <p className="text-sm">{tLayout("readyDescription")}</p>
          </div>
          <Separator orientation="vertical" className="mx-3 h-auto!" />
          <div className="flex-1 space-y-1 text-primary-foreground">
            <p className="font-medium">{tLayout("helpTitle")}</p>
            <p className="text-sm">{tLayout("helpDescription")}</p>
          </div>
        </div>
      </div>
      <div className="relative order-1 flex h-full flex-col overflow-y-auto">
        <div className="flex items-center gap-3 px-6 pt-6 lg:hidden">
          <Image src="/svgs/bth-logo-1.svg" width={40} height={26} alt="logo" loading="eager" />
          <p className="text-lg font-extrabold text-bth-primary uppercase">{t("hospitalName")}</p>
        </div>
        {children}
      </div>
    </main>
  );
}
