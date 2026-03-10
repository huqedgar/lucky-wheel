import type { Metadata } from "next"
import { Bangers, Noto_Sans } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { AppProvider } from "@/components/providers/app-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { cn } from "@/lib/utils"
import "@/app/globals.css"

const notoSans = Noto_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
})

const bangers = Bangers({
  weight: "400",
  subsets: ["latin", "vietnamese"],
  variable: "--font-bangers",
})

export const metadata: Metadata = {
  title: "Vòng Quay May Mắn",
  description: "Vòng quay may mắn - Lucky Wheel",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="vi"
      className={cn("antialiased", notoSans.variable, bangers.variable, "font-sans")}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <ThemeProvider>
          <AppProvider>
            {children}
            <Toaster richColors />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
