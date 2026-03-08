import type { Metadata } from "next"

export const metadata: Metadata = {
  other: {
    'talentapp:project_verification': '44388cc20c53b76e658fd42a0679e234c22e2f97278196bf75bfc12e67b05bcaf81b5726868e4e6582739e7aa4395fde04629e0d2c409431da28f053f2ff59c6',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
