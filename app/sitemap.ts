import { MetadataRoute } from "next";

import { site } from "@/content/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: site.canonicalUrl,
      lastModified: new Date("2026-11-13"),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...Object.values(site.informationPages).map((page) => ({
      url: `${site.canonicalUrl}${page.path}`,
      lastModified: new Date("2026-11-13"),
    })),
  ];
}
