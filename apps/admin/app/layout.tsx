import type { Metadata } from "next"
import { Lexend } from "next/font/google"
import "@workspace/ui/globals.css"
import { ThemeProvider } from "@workspace/ui/components/theme-provider"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Forginity Console",
  description: "Unified administration console for Forginity ecosystem",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("dark antialiased font-sans font-light", lexend.variable)}
    >
      <body className="h-screen max-h-screen overflow-hidden bg-background text-foreground">
        <ThemeProvider defaultTheme="dark">
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
