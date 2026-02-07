import React from 'react'
import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Mono, Space_Mono } from 'next/font/google'
import localFont from 'next/font/local'

import './globals.css'

// Try to load Neue Machina, fallback to Space Mono if not available
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

let neueMachina
try {
  neueMachina = localFont({
    src: [
      {
        path: '../public/fonts/NeueMachina-Light.otf',
        weight: '300',
        style: 'normal',
      },
      {
        path: '../public/fonts/NeueMachina-Regular.otf',
        weight: '400',
        style: 'normal',
      },
      {
        path: '../public/fonts/NeueMachina-Ultrabold.otf',
        weight: '900',
        style: 'normal',
      },
    ],
    variable: '--font-neue-machina',
  })
} catch {
  // Fallback to Space Mono if Neue Machina is not available
  neueMachina = spaceMono
}

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
    <html
      lang="en"
      className={`${neueMachina?.variable || ''} ${ibmPlexMono.variable}`}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
