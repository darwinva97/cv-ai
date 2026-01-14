import type { ResumeStyleConfig } from "@/db/schema/style";

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  slug: string;
  category: "minimal" | "modern" | "classic" | "creative" | "professional" | "tech" | "academic";
  isOfficial: boolean;
  config: ResumeStyleConfig;
  previewColors: {
    primary: string;
    background: string;
    accent?: string;
  };
}

// Base colors configuration
const colors = {
  blue: {
    primary: "#2563eb",
    secondary: "#64748b",
    accent: "#0891b2",
    background: "#ffffff",
    backgroundAlt: "#f8fafc",
    text: "#0f172a",
    textMuted: "#64748b",
    border: "#e2e8f0",
  },
  green: {
    primary: "#16a34a",
    secondary: "#64748b",
    accent: "#15803d",
    background: "#ffffff",
    backgroundAlt: "#f0fdf4",
    text: "#0f172a",
    textMuted: "#64748b",
    border: "#e2e8f0",
  },
  navy: {
    primary: "#1e3a5f",
    secondary: "#475569",
    accent: "#0ea5e9",
    background: "#ffffff",
    backgroundAlt: "#f1f5f9",
    text: "#0f172a",
    textMuted: "#64748b",
    border: "#e2e8f0",
  },
  charcoal: {
    primary: "#374151",
    secondary: "#6b7280",
    accent: "#9ca3af",
    background: "#ffffff",
    backgroundAlt: "#f9fafb",
    text: "#111827",
    textMuted: "#6b7280",
    border: "#e5e7eb",
  },
  burgundy: {
    primary: "#9f1239",
    secondary: "#64748b",
    accent: "#be123c",
    background: "#ffffff",
    backgroundAlt: "#fff1f2",
    text: "#0f172a",
    textMuted: "#64748b",
    border: "#e2e8f0",
  },
  teal: {
    primary: "#0d9488",
    secondary: "#64748b",
    accent: "#14b8a6",
    background: "#ffffff",
    backgroundAlt: "#f0fdfa",
    text: "#0f172a",
    textMuted: "#64748b",
    border: "#e2e8f0",
  },
};

const createBaseConfig = (colorSet: typeof colors.blue): ResumeStyleConfig => ({
  version: 1,
  colors: colorSet,
  typography: {
    headingFont: "Inter, system-ui, sans-serif",
    bodyFont: "Inter, system-ui, sans-serif",
    baseFontSize: 14,
    lineHeight: 1.5,
    headingSizes: {
      h1: 28,
      h2: 18,
      h3: 16,
    },
  },
  spacing: {
    sectionGap: 24,
    itemGap: 16,
    pagePadding: 48,
    contentPadding: 24,
  },
  layout: {
    type: "single-column",
    maxWidth: 800,
    showPhoto: true,
    photoSize: 100,
    photoShape: "circle",
    photoPosition: "header",
  },
  sections: {
    order: ["basics", "summary", "work", "education", "skills", "projects", "certificates", "languages"],
    visible: ["basics", "summary", "work", "education", "skills", "projects", "languages"],
    icons: true,
    dividers: true,
    sectionStyle: "uppercase",
  },
  extras: {
    borderRadius: 8,
    shadowLevel: "none",
    headerStyle: "simple",
    skillStyle: "badge",
    dateStyle: "side",
    bulletStyle: "disc",
    linkStyle: "color",
  },
});

// ============================================
// PREDEFINED RESUME TEMPLATES
// ============================================

export const resumeTemplates: ResumeTemplate[] = [
  // 1. HARVARD STYLE - Classic, professional, academic
  {
    id: "harvard-classic",
    name: "Harvard Classic",
    description: "Estilo académico clásico y profesional, ideal para posiciones corporativas y académicas",
    slug: "harvard-classic",
    category: "academic",
    isOfficial: true,
    previewColors: {
      primary: colors.navy.primary,
      background: colors.navy.background,
      accent: colors.navy.accent,
    },
    config: {
      ...createBaseConfig(colors.navy),
      typography: {
        headingFont: "'Times New Roman', Times, serif",
        bodyFont: "'Times New Roman', Times, serif",
        baseFontSize: 11,
        lineHeight: 1.4,
        headingSizes: {
          h1: 16,
          h2: 12,
          h3: 11,
        },
      },
      spacing: {
        sectionGap: 16,
        itemGap: 10,
        pagePadding: 40,
        contentPadding: 0,
      },
      layout: {
        type: "single-column",
        maxWidth: 850,
        showPhoto: false,
        photoSize: 80,
        photoShape: "square",
        photoPosition: "header",
      },
      sections: {
        order: ["basics", "summary", "work", "education", "skills", "languages", "awards"],
        visible: ["basics", "summary", "work", "education", "skills", "languages", "awards"],
        icons: false,
        dividers: false,
        sectionStyle: "uppercase",
      },
      extras: {
        borderRadius: 0,
        shadowLevel: "none",
        headerStyle: "simple",
        skillStyle: "text",
        dateStyle: "side",
        bulletStyle: "disc",
        linkStyle: "underline",
      },
    },
  },

  // 2. MODERN - Clean, contemporary, tech-friendly
  {
    id: "modern-clean",
    name: "Modern Clean",
    description: "Diseño moderno y limpio con colores sutiles, perfecto para profesionales de tecnología",
    slug: "modern-clean",
    category: "modern",
    isOfficial: true,
    previewColors: {
      primary: colors.blue.primary,
      background: colors.blue.background,
      accent: colors.blue.accent,
    },
    config: {
      ...createBaseConfig(colors.blue),
      typography: {
        headingFont: "Inter, system-ui, sans-serif",
        bodyFont: "Inter, system-ui, sans-serif",
        baseFontSize: 14,
        lineHeight: 1.6,
        headingSizes: {
          h1: 24,
          h2: 16,
          h3: 14,
        },
      },
      layout: {
        type: "single-column",
        maxWidth: 800,
        showPhoto: true,
        photoSize: 100,
        photoShape: "circle",
        photoPosition: "header",
      },
      sections: {
        order: ["basics", "summary", "work", "education", "skills", "projects", "certificates"],
        visible: ["basics", "summary", "work", "education", "skills", "projects"],
        icons: true,
        dividers: true,
        sectionStyle: "uppercase",
      },
      extras: {
        borderRadius: 8,
        shadowLevel: "none",
        headerStyle: "simple",
        skillStyle: "badge",
        dateStyle: "inline",
        bulletStyle: "disc",
        linkStyle: "color",
      },
    },
  },

  // 3. MINIMAL - Simple, elegant, focus on content
  {
    id: "minimal-elegant",
    name: "Minimal Elegant",
    description: "Minimalismo elegante que destaca el contenido sobre el diseño",
    slug: "minimal-elegant",
    category: "minimal",
    isOfficial: true,
    previewColors: {
      primary: colors.charcoal.primary,
      background: colors.charcoal.background,
    },
    config: {
      ...createBaseConfig(colors.charcoal),
      typography: {
        headingFont: "Inter, system-ui, sans-serif",
        bodyFont: "Inter, system-ui, sans-serif",
        baseFontSize: 14,
        lineHeight: 1.5,
        headingSizes: {
          h1: 20,
          h2: 15,
          h3: 14,
        },
      },
      spacing: {
        sectionGap: 20,
        itemGap: 12,
        pagePadding: 48,
        contentPadding: 0,
      },
      layout: {
        type: "single-column",
        maxWidth: 750,
        showPhoto: true,
        photoSize: 90,
        photoShape: "rounded",
        photoPosition: "header",
      },
      sections: {
        order: ["basics", "work", "education", "skills", "projects", "languages"],
        visible: ["basics", "work", "education", "skills", "projects"],
        icons: false,
        dividers: false,
        sectionStyle: "normal",
      },
      extras: {
        borderRadius: 4,
        shadowLevel: "none",
        headerStyle: "simple",
        skillStyle: "text",
        dateStyle: "inline",
        bulletStyle: "dash",
        linkStyle: "underline",
      },
    },
  },

  // 4. CREATIVE - Bold, vibrant, standout
  {
    id: "creative-bold",
    name: "Creative Bold",
    description: "Colores vibrantes y diseño audaz para creativos y diseñadores",
    slug: "creative-bold",
    category: "creative",
    isOfficial: true,
    previewColors: {
      primary: colors.burgundy.primary,
      background: colors.burgundy.background,
      accent: colors.burgundy.accent,
    },
    config: {
      ...createBaseConfig(colors.burgundy),
      typography: {
        headingFont: "'Montserrat', sans-serif",
        bodyFont: "Inter, system-ui, sans-serif",
        baseFontSize: 14,
        lineHeight: 1.6,
        headingSizes: {
          h1: 28,
          h2: 18,
          h3: 16,
        },
      },
      spacing: {
        sectionGap: 28,
        itemGap: 18,
        pagePadding: 40,
        contentPadding: 24,
      },
      layout: {
        type: "sidebar-left",
        maxWidth: 900,
        showPhoto: true,
        photoSize: 120,
        photoShape: "circle",
        photoPosition: "sidebar",
      },
      sections: {
        order: ["basics", "skills", "work", "education", "projects"],
        visible: ["basics", "skills", "work", "education", "projects"],
        icons: true,
        dividers: true,
        sectionStyle: "uppercase",
      },
      extras: {
        borderRadius: 12,
        shadowLevel: "sm",
        headerStyle: "centered",
        skillStyle: "bar",
        dateStyle: "badge",
        bulletStyle: "arrow",
        linkStyle: "button",
      },
    },
  },

  // 5. TECH - Developer-focused, clean code aesthetic
  {
    id: "tech-dev",
    name: "Tech Dev",
    description: "Estilo optimizado para desarrolladores con énfasis en habilidades técnicas",
    slug: "tech-dev",
    category: "tech",
    isOfficial: true,
    previewColors: {
      primary: colors.teal.primary,
      background: colors.teal.background,
      accent: colors.teal.accent,
    },
    config: {
      ...createBaseConfig(colors.teal),
      typography: {
        headingFont: "'Source Code Pro', monospace",
        bodyFont: "Inter, system-ui, sans-serif",
        baseFontSize: 14,
        lineHeight: 1.5,
        headingSizes: {
          h1: 22,
          h2: 16,
          h3: 14,
        },
      },
      spacing: {
        sectionGap: 20,
        itemGap: 14,
        pagePadding: 48,
        contentPadding: 20,
      },
      layout: {
        type: "two-column",
        maxWidth: 900,
        showPhoto: true,
        photoSize: 100,
        photoShape: "rounded",
        photoPosition: "header",
      },
      sections: {
        order: ["basics", "skills", "work", "projects", "education", "certificates"],
        visible: ["basics", "skills", "work", "projects", "education", "certificates"],
        icons: true,
        dividers: true,
        sectionStyle: "uppercase",
      },
      extras: {
        borderRadius: 6,
        shadowLevel: "none",
        headerStyle: "simple",
        skillStyle: "badge",
        dateStyle: "side",
        bulletStyle: "square",
        linkStyle: "color",
      },
    },
  },

  // 6. PROFESSIONAL - Corporate, clean, trustworthy
  {
    id: "professional-corporate",
    name: "Professional Corporate",
    description: "Estilo corporativo limpio y profesional para empresarias y ejecutivos",
    slug: "professional-corporate",
    category: "professional",
    isOfficial: true,
    previewColors: {
      primary: colors.green.primary,
      background: colors.green.background,
      accent: colors.green.accent,
    },
    config: {
      ...createBaseConfig(colors.green),
      typography: {
        headingFont: "'Georgia', serif",
        bodyFont: "Inter, system-ui, sans-serif",
        baseFontSize: 13,
        lineHeight: 1.5,
        headingSizes: {
          h1: 22,
          h2: 16,
          h3: 14,
        },
      },
      spacing: {
        sectionGap: 22,
        itemGap: 14,
        pagePadding: 48,
        contentPadding: 20,
      },
      layout: {
        type: "single-column",
        maxWidth: 800,
        showPhoto: true,
        photoSize: 110,
        photoShape: "rounded",
        photoPosition: "header",
      },
      sections: {
        order: ["basics", "summary", "experience", "education", "leadership", "skills", "awards"],
        visible: ["basics", "summary", "work", "education", "skills", "awards"],
        icons: true,
        dividers: true,
        sectionStyle: "capitalize",
      },
      extras: {
        borderRadius: 6,
        shadowLevel: "none",
        headerStyle: "split",
        skillStyle: "badge",
        dateStyle: "side",
        bulletStyle: "disc",
        linkStyle: "color",
      },
    },
  },
];

// Helper to get template by ID
export function getTemplateById(id: string): ResumeTemplate | undefined {
  return resumeTemplates.find((t) => t.id === id);
}

// Helper to get templates by category
export function getTemplatesByCategory(category: string): ResumeTemplate[] {
  if (category === "all") return resumeTemplates;
  return resumeTemplates.filter((t) => t.category === category);
}

// Template categories for filters
export const templateCategories = [
  { value: "all", label: "Todos" },
  { value: "minimal", label: "Minimal" },
  { value: "modern", label: "Moderno" },
  { value: "classic", label: "Clásico" },
  { value: "creative", label: "Creativo" },
  { value: "professional", label: "Profesional" },
  { value: "tech", label: "Tech" },
  { value: "academic", label: "Académico" },
] as const;
