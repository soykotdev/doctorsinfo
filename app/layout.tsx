import React from 'react';
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from '../components/Footer';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Doctor Finder",
  description: "Find doctors by specialty",
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="layout-container">
          <Navbar />
          <main style={{ paddingTop: '20px', paddingBottom: '20px' }}>
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
