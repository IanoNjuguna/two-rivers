import React from "react"

// Root layout is minimal — the locale layout handles everything
// This exists as a pass-through for Next.js
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
