import { ImageResponse } from "next/og";
import { getPublicResume } from "@/actions/resume";

// Imagen de preview al compartir el CV (WhatsApp, LinkedIn, X, etc.).
// Runtime nodejs (default) porque getPublicResume usa la BD (no edge).
export const alt = "CV — CV AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ id_or_slug: string }>;
}) {
  const { id_or_slug } = await params;
  const result = await getPublicResume(id_or_slug).catch(() => null);

  const name = result?.data?.basics?.name || result?.resume.title || "CV";
  const label = result?.data?.basics?.label || "";
  const image = result?.data?.basics?.image || "";
  const showImg = /^https?:\/\//.test(image);

  const primary = "#2563eb";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0f172a",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Accent bar */}
        <div style={{ display: "flex", width: "120px", height: "10px", backgroundColor: primary, borderRadius: "6px" }} />

        {/* Center: avatar + name + label */}
        <div style={{ display: "flex", alignItems: "center", gap: "44px" }}>
          {showImg && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              width={220}
              height={220}
              style={{
                width: "220px",
                height: "220px",
                borderRadius: "50%",
                objectFit: "cover",
                border: `6px solid ${primary}`,
              }}
            />
          )}
          <div style={{ display: "flex", flexDirection: "column", maxWidth: showImg ? "760px" : "100%" }}>
            <div
              style={{
                display: "flex",
                fontSize: name.length > 26 ? "64px" : "80px",
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: 1.05,
              }}
            >
              {name}
            </div>
            {label && (
              <div style={{ display: "flex", fontSize: "38px", color: "#94a3b8", marginTop: "16px" }}>
                {label}
              </div>
            )}
          </div>
        </div>

        {/* Footer: branding */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "30px", color: "#cbd5e1" }}>
          <div style={{ display: "flex", width: "22px", height: "22px", borderRadius: "50%", backgroundColor: primary }} />
          <div style={{ display: "flex" }}>CV AI</div>
          <div style={{ display: "flex", color: "#64748b" }}>cv-ai.bezenti.com</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
