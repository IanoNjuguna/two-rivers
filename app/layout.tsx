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
  title: 'Music NFT Dashboard',
  description: 'Collaborative Music NFT Marketplace on Base Sepolia',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0D0D12',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark ${spaceMono.variable} ${ibmPlexMono.variable}`}>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
