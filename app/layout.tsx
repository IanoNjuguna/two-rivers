import React from "react"
import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Mono, Space_Mono } from 'next/font/google'

import './globals.css'

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'doba',
  description: 'doba – Collaborative Music NFT Marketplace on Arbitrum Sepolia',
  generator: 'v0.app',
  openGraph: {
    images: [
      {
        url: '/doba_preview.png',
        width: 1200,
        height: 630,
        alt: 'doba Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/doba_preview.png'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0D0D12',
}

import { Providers } from "@/components/Providers"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark ${spaceMono.variable} ${ibmPlexMono.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.ico" type="image/x-icon" />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
