import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Geist } from "next/font/google";
import "./globals.css";
import { Analytics } from '@vercel/analytics/next';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Interview Platform",
  description: "AI Interview Platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


    
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.className} antialiased pattern`}
        suppressHydrationWarning={true}
      >
        {children}
        <Analytics />
        <Toaster />
      </body>
    </html>
  );
}
