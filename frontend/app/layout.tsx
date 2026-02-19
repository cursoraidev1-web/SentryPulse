import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SentryPulse - Website Monitoring & Analytics',
  description: 'Professional website uptime monitoring, analytics, and incident management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <Toaster position="top-right" />
        {children}
        </body>
    </html>
  );
}
