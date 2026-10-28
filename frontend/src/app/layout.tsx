import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "texHAAB | AI Knitting Recipe Recommender (Space-Lab Edition)",
  description: "AI-driven circular knitting machine setup recommender with cosmic neural intelligence",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body className="min-h-screen bg-[#030014] text-purple-100 antialiased font-sans selection:bg-purple-500 selection:text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
