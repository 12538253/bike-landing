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

import { GoogleAnalytics } from "@next/third-parties/google";

export const metadata: Metadata = {
  metadataBase: new URL("https://bike-manager.pages.dev"),
  title: "바이크매니저 - 프리미엄 중고 오토바이 매입",
  description: "당근, 중고나라보다 빠르고 안전하게. 수도권 2시간 내 방문, 1시간 내 입금. 내 바이크 견적 1분 만에 확인하세요.",
  openGraph: {
    title: "바이크매니저 - 프리미엄 중고 오토바이 매입",
    description: "내 바이크, 헐값에 넘기지 마세요. 수도권 2시간 내 방문, 100% 현장 계좌 이체.",
    url: "https://bike-manager.com", // Replace with actual domain later
    siteName: "Bike Manager",
    images: [
      {
        url: "/images/hero-bg.png", // Using the hero image as OG image
        width: 1200,
        height: 630,
        alt: "Bike Manager Hero",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
};

import StickyBottomBar from "@/components/StickyBottomBar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
        <StickyBottomBar />
        <GoogleAnalytics gaId="G-XXXXXXXXXX" />
      </body>
    </html>
  );
}
