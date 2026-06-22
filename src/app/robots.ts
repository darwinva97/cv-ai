import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_APP_URL || "https://cv-ai.bezenti.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Áreas privadas / de aplicación: no tiene sentido indexarlas.
        disallow: [
          "/api/",
          "/admin",
          "/dashboard",
          "/settings",
          "/billing",
          "/resume/",
          "/resumes",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
