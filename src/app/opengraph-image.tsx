import { ImageResponse } from "next/og";

// Imagen OpenGraph por defecto del sitio (landing, privacidad, términos, …).
export const alt = "CV AI - Crea tu CV perfecto con inteligencia artificial";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const primary = "#2563eb";
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "#0f172a",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "34px", color: primary, fontWeight: 700 }}>
          <div style={{ display: "flex", width: "30px", height: "30px", borderRadius: "50%", backgroundColor: primary }} />
          <div style={{ display: "flex" }}>CV AI</div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "72px",
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.08,
            marginTop: "28px",
            maxWidth: "1000px",
          }}
        >
          Crea tu CV perfecto con inteligencia artificial
        </div>
        <div style={{ display: "flex", fontSize: "34px", color: "#94a3b8", marginTop: "24px" }}>
          Currículums personalizados para cada oferta de trabajo
        </div>
      </div>
    ),
    { ...size }
  );
}
