"use client";

import './globals.css';
import { Providers } from './providers'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { MobileNavigation } from '@/components/MobileNavigation'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <Header />
          <main>{children}</main>
          <Footer />
          <MobileNavigation />
        </Providers>
      </body>
    </html>
  );
}
