import type React from "react"
import type { Metadata } from "next"
import ClientLayout from "./ClientLayout"

export const metadata: Metadata = {
  title: "CoinShillers - The Army of Shillers Never Sleeps",
  description: "Be part of the new Web 3.0 era. Growth, revolution and community united in one token.",
  keywords: "CoinShillers, SHILL, crypto, Web3, Pepe Unchained, Arbitrum, token",
  authors: [{ name: "CoinShillers Team" }],
  openGraph: {
    title: "CoinShillers - The Army of Shillers Never Sleeps",
    description: "Be part of the new Web 3.0 era. Growth, revolution and community united in one token.",
    url: "https://coinshillers.com",
    siteName: "CoinShillers",
    images: [
      {
        url: "/images/logo-banner.png",
        width: 1200,
        height: 630,
        alt: "CoinShillers Banner",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CoinShillers - The Army of Shillers Never Sleeps",
    description: "Be part of the new Web 3.0 era. Growth, revolution and community united in one token.",
    images: ["/images/logo-banner.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientLayout>{children}</ClientLayout>
}


import './globals.css'