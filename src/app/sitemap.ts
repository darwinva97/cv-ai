import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_APP_URL || "https://cv-ai.bezenti.com";

// Rutas públicas estáticas. Los CV públicos (/resume-result/*) no se listan
// aquí para no exponer un índice de todos los perfiles; cada autor comparte
// su propio enlace.
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/privacy", "/terms"];
  return routes.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.4,
  }));
}
