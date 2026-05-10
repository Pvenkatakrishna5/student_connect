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
    "Find flexible, skill-matched part-time jobs. 2,400+ students earning real money. Tutoring, design, tech, content writing, events, and more across India.",
  keywords: "student jobs, part-time jobs India, freelance students, skill-based jobs, earn money college",
  manifest: "/manifest.json",
  openGraph: {
    title: "StudentConnect — Work Smart. Learn Real.",
    description: "India's premier platform connecting students with real part-time job opportunities.",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#6C63FF",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} ${jetbrains.variable}`}>
      <body className="noise"><AuthProvider>{children}</AuthProvider></body>
    </html>
  );
}
