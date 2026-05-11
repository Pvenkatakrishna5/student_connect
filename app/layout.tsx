import type { Metadata } from "next";
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StudentConnect — Skill-Based Part-Time Jobs for Students",
  description:
    "India's premier skill-based marketplace for students. Earn while you learn, build your professional portfolio, and gain real-world experience.",
  keywords: "student jobs, part-time jobs India, freelance students, skill-based jobs, earn money college, internship, gig economy",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "StudentConnect",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "StudentConnect — Work Smart. Learn Real.",
    description: "India's premier platform connecting students with real part-time job opportunities.",
    type: "website",
    siteName: "StudentConnect",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "StudentConnect",
    description: "Skill-Based Part-Time Jobs for Students",
  },
};

export const viewport = {
  themeColor: "#050508",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} ${jetbrains.variable}`}>
      <body className="noise"><AuthProvider>{children}</AuthProvider></body>
    </html>
  );
}
