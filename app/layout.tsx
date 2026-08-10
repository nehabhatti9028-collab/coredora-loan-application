import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppProviders } from '@/components/app-providers';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Credora — Modern Lending, Simplified',
  description:
    'Credora is a modern lending platform. Apply for personal, home, auto, and business loans with a guided 8-step process and track every stage in real time.',
  applicationName: 'Credora',
  authors: [{ name: 'Credora' }],
  keywords: ['loans', 'lending', 'fintech', 'EMI calculator', 'loan application'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <AppProviders>{children}</AppProviders>
        <SonnerToaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
