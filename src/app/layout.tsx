import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { enableMapSet } from 'immer';

enableMapSet();

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Annotation Console',
  description: 'Task management for annotation workflows',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
