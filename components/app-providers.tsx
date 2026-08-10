'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/components/providers';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <AuthProvider>
        <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
      </AuthProvider>
    </NextThemesProvider>
  );
}
