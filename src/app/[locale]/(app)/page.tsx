import { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { AppHome } from "./_components/app-home";

export default async function AppHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return <AppHome />;
}
