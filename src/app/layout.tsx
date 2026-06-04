import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { SiteHeader } from '@/components/shared/site-header';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3030',
  ),
  title: 'Quadratic Vote — vote with how much you care',
  description:
    'Create a quadratic-voting poll, share a link, vote on your phone in 90 seconds. No signup. No wallet. Just decisions that capture how much each person cares.',
  openGraph: {
    title: 'Quadratic Vote',
    description: 'Vote with how much you care. No signup. No wallet.',
    type: 'website',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quadratic Vote',
    description: 'Vote with how much you care. No signup. No wallet.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background">
        <SiteHeader />
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
