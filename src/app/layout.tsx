import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bricks & Mortar',
  description: 'Property expense tracking application for homeowners, landlords, and renters',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
