"use client"

import type React from "react"
import { Exo_2 } from "next/font/google"
import "./globals.css"

const exo2 = Exo_2({
  subsets: ["latin"],
  variable: "--font-exo2",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
})

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${exo2.variable}`}>
      <head>
        <link rel="icon" href="/images/profile-logo.png" />
        <meta name="theme-color" content="#1e40af" />
      </head>
      <body className={`${exo2.className} antialiased`}>{children}</body>
    </html>
  )
}
