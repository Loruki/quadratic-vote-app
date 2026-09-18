import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { MotionProvider } from '@/components/shared/motion-provider';
import { SiteHeader } from '@/components/shared/site-header';
import { SiteFooter } from '@/components/shared/site-footer';
import { PostHogProvider } from '@/growth-kit';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3030',
  ),
  title: 'Quadratic Vote — find out what your group cares about most',
  description:
    'Prioritize as a team, a committee or a family. Everyone gets the same credits, and stacking votes on one option gets expensive, so broad support wins. One link, 90 seconds on a phone, no signup.',
  openGraph: {
    title: 'Quadratic Vote',
    description: 'Find out what your group cares about most. One link, no signup.',
    type: 'website',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quadratic Vote',
    description: 'Find out what your group cares about most. One link, no signup.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background">
        <PostHogProvider app="quadratic-vote">
          <MotionProvider>
            <SiteHeader />
            {children}
            <SiteFooter />
            <Toaster richColors position="top-center" />
          </MotionProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
