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
  metadataBase: new URL("https://www.bike-manager.com"),
  title: "바이크매니저 | 전국 중고 오토바이 최고가 당일 매입 (PCX, R3, 할리)",
  description: "당근마켓보다 빠르고 안전하게. 인천, 부천, 서울, 경기 1시간 내 무료 출장. 중고 바이크 전 기종 최고가 매입. 010-5712-0080",
  keywords: ["중고오토바이매입", "중고바이크매입", "오토바이판매", "바이크매니저", "인천오토바이"],
  other: {
    "naver-site-verification": "", // 추후 값 입력 필요
    "google-site-verification": "", // 추후 값 입력 필요
  },
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "바이크매니저 | 전국 중고 오토바이 최고가 당일 매입",
    description: "당근마켓보다 빠르고 안전하게. 수도권 2시간 내 방문, 100% 현장 계좌 이체.",
    url: "https://www.bike-manager.com",
    siteName: "Bike Manager",
    images: [
      {
        url: "/images/hero-bg.png",
        width: 1200,
        height: 630,
        alt: "바이크매니저 - 프리미엄 중고 오토바이 매입",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "바이크매니저",
  "image": "https://www.bike-manager.com/images/hero-bg.png",
  "telephone": "010-5712-0080",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "백범로 411",
    "addressLocality": "Namdong-gu",
    "addressRegion": "Incheon",
    "postalCode": "21500",
    "addressCountry": "KR"
  },
  "url": "https://www.bike-manager.com",
  "priceRange": "KRW",
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday"
    ],
    "opens": "09:00",
    "closes": "22:00"
  }
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <GoogleAnalytics gaId="G-XXXXXXXXXX" />
      </body>
    </html>
  );
}
