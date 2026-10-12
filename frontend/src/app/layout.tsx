import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://frontend-green-ten-30.vercel.app"),
  title: {
    default: "ScoutPilot AI — Search live. Compare evidence. Make better decisions.",
    template: "%s | ScoutPilot AI",
  },
  description:
    "Autonomous research and decision-support AI agent powered by SerpApi. Demonstrates Plan, Search, Compare, and Act capabilities with transparent evidence grounding.",
  keywords: [
    "ScoutPilot AI",
    "SerpApi",
    "AI Agents Track",
    "Autonomous Research Agent",
    "Decision Support System",
    "Google Shopping",
    "Agentic AI",
    "Evidence Grounding",
  ],
  authors: [{ name: "ScoutPilot Team" }],
  creator: "ScoutPilot AI",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://scoutpilot-ai.vercel.app",
    title: "ScoutPilot AI — Autonomous Research & Decision Agent",
    description:
      "Search live. Compare evidence. Make better decisions. Built for everyone",
    siteName: "ScoutPilot AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "ScoutPilot AI — Autonomous Research Agent",
    description:
      "Autonomous decision-support powered by SerpApi. Real-time planning, search, comparison matrix, and action checklists.",
  },
  icons: {
    icon: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full dark antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full bg-slate-950 text-slate-100 flex flex-col font-sans"
      >
        {children}
      </body>
    </html>
  );
}
