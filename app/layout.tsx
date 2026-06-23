import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  title: "Xyncure — Book a Doctor in Kerala",
  description: "Find and book doctor appointments instantly in Kerala. WhatsApp confirmation in seconds. No calls, no wait.",
  openGraph: {
    title: "Xyncure — Book a Doctor in Kerala",
    description: "Find and book doctor appointments instantly in Kerala.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
