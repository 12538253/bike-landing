import type { Metadata, Viewport } from "next";

import StickyInquiryBar from "@/components/StickyInquiryBar";
import { site } from "@/content/site";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.canonicalUrl),
  title: site.metadata.title,
  description: site.metadata.description,
  keywords: [...site.metadata.keywords],
  alternates: {
    canonical: site.canonicalUrl,
  },
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: site.metadata.title,
    description: site.metadata.description,
    url: site.canonicalUrl,
    siteName: site.name,
    images: [
      {
        url: site.metadata.ogImage,
        width: 1200,
        height: 630,
        alt: site.metadata.ogImageAlt,
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: site.metadata.title,
    description: site.metadata.description,
    images: [site.metadata.ogImage],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0C1A1C",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${site.canonicalUrl}/#business`,
  name: site.name,
  image: `${site.canonicalUrl}${site.metadata.ogImage}`,
  telephone: site.phone.display,
  url: site.canonicalUrl,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address.street,
    addressLocality: site.address.locality,
    addressRegion: site.address.region,
    addressCountry: site.address.country,
  },
  areaServed: ["인천광역시", "서울특별시", "경기도"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="preload"
          as="image"
          href="/images/hero-mobile-v3.webp"
          type="image/webp"
          media="(max-width: 760px)"
        />
        <link
          rel="preload"
          as="image"
          href="/images/hero-bg-v3.webp"
          type="image/webp"
          media="(min-width: 761px)"
        />
      </head>
      <body>
        {children}
        <StickyInquiryBar />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
