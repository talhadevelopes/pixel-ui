import { Inter, Space_Grotesk, Sora, Urbanist, Plus_Jakarta_Sans, Manrope, Outfit, Lexend, Figtree, Karla } from "next/font/google"
import "@workspace/ui/globals.css"
import { Providers } from "@/components/global/ProviderWrapper"
import { Toaster } from "sonner"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pixel UI - AI-Powered Design-to-Code",
  description: "Generate modern user interfaces with AI",
  icons: {
    icon: "/favicon.ico",
  },
}

// const fontSans = Sora({
//   subsets: ["latin"],
//   variable: "--font-sans",
// })


const fontSans = Lexend({
  subsets: ["latin"],
  variable: "--font-sans",
})


const fontMono = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}