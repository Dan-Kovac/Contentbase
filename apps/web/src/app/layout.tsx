import type { Metadata } from "next"
import { Schibsted_Grotesk, Source_Serif_4, IBM_Plex_Mono, Barlow_Condensed, Archivo } from "next/font/google"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css"

const schibsted = Schibsted_Grotesk({ subsets: ["latin"], variable: "--font-schibsted", weight: ["400", "500", "600", "700", "800", "900"] })
const sourceSerif = Source_Serif_4({ subsets: ["latin"], variable: "--font-source-serif", style: ["normal", "italic"] })
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-plex-mono", weight: ["400", "500"] })
const barlowCondensed = Barlow_Condensed({ subsets: ["latin"], variable: "--font-barlow-condensed", weight: ["600", "700"] })
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo-face", weight: ["400", "600", "800"] })

export const metadata: Metadata = {
  title: { default: "Homestand · Your channel. Your audience.", template: "%s · Homestand" },
  description:
    "Connect YouTube and every video becomes an article, shorts and a page that ranks. You own all of it.",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-AU"
      suppressHydrationWarning
      className={`${schibsted.variable} ${sourceSerif.variable} ${plexMono.variable} ${barlowCondensed.variable} ${archivo.variable}`}
    >
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
