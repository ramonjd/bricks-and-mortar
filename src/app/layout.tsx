import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bricks & Mortar',
  description: 'Property expense tracking application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
} 