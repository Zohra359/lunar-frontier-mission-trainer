
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MissionNoticeProvider } from "@/components/layout/MissionNotice";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Lunar Frontier — Junior Astronaut Mission Trainer",
    template: "%s · Lunar Frontier",
  },
  description:
    "An educational lunar mission-management game. Command an outpost, manage resources and protect your crew beyond Earth.",
};

export const viewport: Viewport = {
  themeColor: "#02040a",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className="bg-void">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
      >
        <MissionNoticeProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-sm focus:bg-signal focus:px-4 focus:py-2 focus:text-xs focus:font-semibold focus:uppercase focus:tracking-[0.2em] focus:text-void"
          >
            Skip to content
          </a>
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </MissionNoticeProvider>
      </body>
    </html>
  );
}
