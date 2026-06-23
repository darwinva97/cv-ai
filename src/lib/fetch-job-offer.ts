import "server-only";

/**
 * Descarga una oferta de trabajo desde su URL y extrae el texto plano (sin
 * etiquetas) para alimentar la optimización del CV. Devuelve null si la URL no
 * es válida o no se puede leer. Best-effort: sin dependencias pesadas.
 */
export async function fetchJobOfferText(rawUrl: string): Promise<string | null> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  try {
    const res = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; CV-AI/1.0; +https://cv-ai.bezenti.com)",
        accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("text/")) {
      return null;
    }

    const html = await res.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&#\d+;/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (text.length < 40) return null; // probablemente JS-rendered / sin contenido útil
    return text.slice(0, 6000);
  } catch {
    return null;
  }
}
