import { defaultStyleConfig } from "@/db/schema/style";
import type { ResumeStyleConfig } from "@/db/schema/style";

/**
 * Presets de diseño reales (variantes de ResumeStyleConfig). Son la fuente de
 * verdad para la selección automática y el cambio de diseño en el flujo de
 * generación gratuita del inicio, y pueden sembrarse en `resume_style` para la
 * galería.
 */
export interface StylePreset {
  id: string;
  name: string;
  description: string;
  /** Palabras clave de rol que favorecen este diseño (para auto-selección). */
  roleHints: string[];
  config: ResumeStyleConfig;
}

type Over = {
  colors?: Partial<ResumeStyleConfig["colors"]>;
  typography?: Partial<ResumeStyleConfig["typography"]>;
  spacing?: Partial<ResumeStyleConfig["spacing"]>;
  layout?: Partial<ResumeStyleConfig["layout"]>;
  sections?: Partial<ResumeStyleConfig["sections"]>;
  extras?: Partial<ResumeStyleConfig["extras"]>;
};

function build(over: Over): ResumeStyleConfig {
  return {
    ...defaultStyleConfig,
    colors: { ...defaultStyleConfig.colors, ...over.colors },
    typography: { ...defaultStyleConfig.typography, ...over.typography },
    spacing: { ...defaultStyleConfig.spacing, ...over.spacing },
    layout: { ...defaultStyleConfig.layout, ...over.layout },
    sections: { ...defaultStyleConfig.sections, ...over.sections },
    extras: { ...defaultStyleConfig.extras, ...over.extras },
  };
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: "clasico-azul",
    name: "Clásico Azul",
    description: "Una columna, sobrio y legible. Ideal para casi cualquier rol.",
    roleHints: ["general", "administrativo", "ventas", "finanzas", "contador"],
    config: defaultStyleConfig,
  },
  {
    id: "moderno-esmeralda",
    name: "Moderno Esmeralda",
    description: "Limpio y fresco, encabezados en mayúsculas y acento verde.",
    roleHints: ["marketing", "producto", "growth", "comunicaciones"],
    config: build({
      colors: { primary: "#059669", accent: "#0d9488" },
      sections: { sectionStyle: "uppercase" },
    }),
  },
  {
    id: "dos-columnas-indigo",
    name: "Dos Columnas Índigo",
    description: "Barra lateral con contacto y skills. Aprovecha el espacio.",
    roleHints: ["desarrollador", "developer", "ingeniero", "engineer", "data", "software"],
    config: build({
      colors: { primary: "#4f46e5", accent: "#7c3aed" },
      layout: { type: "two-column", sidebarWidth: 34 },
    }),
  },
  {
    id: "sidebar-purpura",
    name: "Sidebar Púrpura",
    description: "Barra lateral izquierda con carácter. Bueno para perfiles creativos.",
    roleHints: ["diseñador", "designer", "ux", "ui", "creativo", "arte", "audiovisual"],
    config: build({
      colors: { primary: "#7c3aed", accent: "#9333ea" },
      layout: { type: "sidebar-left", sidebarWidth: 32 },
      sections: { sectionStyle: "capitalize" },
    }),
  },
  {
    id: "minimal-grafito",
    name: "Minimal Grafito",
    description: "Monocromo y elegante, sin distracciones. Perfiles senior/ejecutivos.",
    roleHints: ["gerente", "manager", "director", "lead", "consultor", "legal", "abogado"],
    config: build({
      colors: { primary: "#1e293b", secondary: "#475569", accent: "#334155" },
      sections: { sectionStyle: "normal", dividers: true },
      extras: { skillStyle: "text", borderRadius: 4 },
    }),
  },
  {
    id: "compacto-carmesi",
    name: "Compacto Carmesí",
    description: "Denso y enérgico, ideal cuando hay mucha experiencia que mostrar.",
    roleHints: ["salud", "médico", "enfermería", "docente", "profesor", "operaciones"],
    config: build({
      colors: { primary: "#be123c", accent: "#e11d48" },
      spacing: { sectionGap: 18, itemGap: 12, pagePadding: 40 },
      sections: { sectionStyle: "uppercase" },
    }),
  },
];

export const DEFAULT_PRESET_ID = STYLE_PRESETS[0].id;

export function getPreset(id: string | undefined | null): StylePreset {
  return STYLE_PRESETS.find((p) => p.id === id) ?? STYLE_PRESETS[0];
}

/**
 * Elige un diseño automáticamente según el título/rol del candidato y, en
 * segundo lugar, según el texto de la oferta. Heurística simple por palabras
 * clave; cae al preset por defecto si no hay coincidencias.
 */
export function autoPickPreset(opts: {
  label?: string | null;
  jobOffer?: string | null;
}): StylePreset {
  const haystack = `${opts.label ?? ""} ${opts.jobOffer ?? ""}`.toLowerCase();
  if (haystack.trim()) {
    for (const preset of STYLE_PRESETS) {
      if (preset.roleHints.some((hint) => haystack.includes(hint))) {
        return preset;
      }
    }
  }
  return STYLE_PRESETS[0];
}
