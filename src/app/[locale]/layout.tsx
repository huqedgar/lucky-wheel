import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider, type Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/components/providers/app-provider";
import { LayoutProvider } from "@/components/providers/layout-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import { routing } from "@/i18n/routing";
import "@/app/[locale]/globals.css";

const notoSans = Noto_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export async function generateMetadata(props: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "Metadata",
  });
  return {
    title: {
      template: `%s | ${t("title")}`,
      default: t("defaultTitle"),
    },
    description: t("description"),
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale as Locale);

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={cn("antialiased", fontMono.variable, "font-sans", notoSans.variable)}
      suppressHydrationWarning
    >
      <body className={"group/body"} suppressHydrationWarning>
        <NextTopLoader color="var(--bth-primary)" showSpinner={false} />
        <NextIntlClientProvider>
          <ThemeProvider>
            <TooltipProvider>
              <LayoutProvider>
                <AppProvider>
                  {children}
                  <Toaster richColors />
                </AppProvider>
              </LayoutProvider>
            </TooltipProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
