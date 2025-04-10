import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bricks & Mortar',
  description: 'Property expense tracking application for homeowners, landlords, and renters',
};

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <html lang={params.locale}>
      <body>{children}</body>
    </html>
  );
}
