import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: "https://www.bike-manager.com",
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
    ];
}
