import { MetadataRoute } from "next";

import { site } from "@/content/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: site.canonicalUrl,
      lastModified: new Date("2026-08-15"),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
