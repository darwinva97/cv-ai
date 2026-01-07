import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  jsonb,
  integer,
  pgEnum,
  primaryKey,
  customType,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

// Enum para categorías de estilos
export const styleCategory = pgEnum("style_category", [
  "minimal",
  "modern",
  "classic",
  "creative",
  "professional",
  "tech",
  "academic",
  "other",
]);

// Enum para tipo de layout
export const layoutType = pgEnum("layout_type", [
  "single-column",
  "two-column",
  "sidebar-left",
  "sidebar-right",
]);

// Tipo para la configuración de colores
export interface StyleColors {
  primary: string; // Color principal (headers, links)
  secondary: string; // Color secundario
  accent: string; // Color de acento
  background: string; // Fondo principal
  backgroundAlt: string; // Fondo alternativo (secciones)
  text: string; // Color de texto principal
  textMuted: string; // Color de texto secundario
  border: string; // Color de bordes
}

// Tipo para la configuración de tipografía
export interface StyleTypography {
  headingFont: string; // Font family para títulos
  bodyFont: string; // Font family para cuerpo
  baseFontSize: number; // Tamaño base en px
  lineHeight: number; // Line height
  headingSizes: {
    h1: number;
    h2: number;
    h3: number;
  };
}

// Tipo para espaciado
export interface StyleSpacing {
  sectionGap: number; // Espacio entre secciones
  itemGap: number; // Espacio entre items
  pagePadding: number; // Padding de la página
  contentPadding: number; // Padding del contenido
}

// Tipo para el layout
export interface StyleLayout {
  type: "single-column" | "two-column" | "sidebar-left" | "sidebar-right";
  sidebarWidth?: number; // Porcentaje del ancho (para layouts con sidebar)
  maxWidth: number; // Ancho máximo en px
  showPhoto: boolean;
  photoSize: number; // Tamaño de la foto en px
  photoShape: "circle" | "square" | "rounded";
  photoPosition: "header" | "sidebar" | "inline";
}

// Tipo para configuración de secciones
export interface StyleSections {
  order: string[]; // Orden de las secciones
  visible: string[]; // Secciones visibles
  icons: boolean; // Mostrar iconos en secciones
  dividers: boolean; // Mostrar divisores entre secciones
  sectionStyle: "uppercase" | "capitalize" | "normal";
}

// Tipo para estilos adicionales
export interface StyleExtras {
  borderRadius: number;
  shadowLevel: "none" | "sm" | "md" | "lg";
  headerStyle: "simple" | "banner" | "centered" | "split";
  skillStyle: "bar" | "badge" | "dot" | "text";
  dateStyle: "inline" | "side" | "badge";
  bulletStyle: "disc" | "circle" | "square" | "dash" | "arrow";
  linkStyle: "underline" | "color" | "button";
}

// Schema completo del estilo
export interface ResumeStyleConfig {
  version: number; // Versión del schema para migraciones
  colors: StyleColors;
  typography: StyleTypography;
  spacing: StyleSpacing;
  layout: StyleLayout;
  sections: StyleSections;
  extras: StyleExtras;
  customCSS?: string; // CSS personalizado adicional
}

// Tabla principal de estilos
export const resumeStyle = pgTable("resume_style", {
  id: uuid("id").defaultRandom().primaryKey(),
  
  // Metadatos básicos
  name: text("name").notNull(),
  description: text("description"),
  slug: text("slug").unique(), // Para URLs amigables
  
  // Autor
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  
  // Visibilidad y comunidad
  isPublic: boolean("is_public").default(false).notNull(),
  isOfficial: boolean("is_official").default(false).notNull(), // Estilos oficiales de la plataforma
  isFeatured: boolean("is_featured").default(false).notNull(), // Destacados
  
  // Si es un fork de otro estilo
  forkedFromId: uuid("forked_from_id").references((): any => resumeStyle.id, {
    onDelete: "set null",
  }),
  
  // Categorización
  category: styleCategory("category").default("modern").notNull(),
  tags: jsonb("tags").$type<string[]>().default([]),
  
  // Configuración del estilo (el corazón del tema)
  config: jsonb("config").$type<ResumeStyleConfig>().notNull(),
  
  // Preview
  thumbnailUrl: text("thumbnail_url"), // URL de la preview del estilo
  
  // Stats
  usageCount: integer("usage_count").default(0).notNull(),
  likesCount: integer("likes_count").default(0).notNull(),
  forksCount: integer("forks_count").default(0).notNull(),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Likes de usuarios a estilos
export const resumeStyleLike = pgTable(
  "resume_style_like",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    styleId: uuid("style_id")
      .notNull()
      .references(() => resumeStyle.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.styleId] })]
);

// Estilos guardados/favoritos del usuario
export const resumeStyleSaved = pgTable(
  "resume_style_saved",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    styleId: uuid("style_id")
      .notNull()
      .references(() => resumeStyle.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.styleId] })]
);

// Custom ltree type for referencing resume versions
const ltreeType = customType<{ data: string }>({
  dataType() {
    return "ltree";
  },
});

// Relación entre versión de CV y estilo aplicado
export const resumeVersionStyle = pgTable(
  "resume_version_style",
  {
    resumeVersionId: ltreeType("resume_version_id").notNull(),
    styleId: uuid("style_id")
      .notNull()
      .references(() => resumeStyle.id, { onDelete: "cascade" }),
    // Overrides específicos para esta versión del CV
    configOverrides: jsonb("config_overrides").$type<Partial<ResumeStyleConfig>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.resumeVersionId, table.styleId] })]
);

// Presets de colores predefinidos (para picker rápido)
export const colorPreset = pgTable("color_preset", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  colors: jsonb("colors").$type<StyleColors>().notNull(),
  isOfficial: boolean("is_official").default(false).notNull(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// Configuración por defecto para nuevos estilos
// ============================================
export const defaultStyleConfig: ResumeStyleConfig = {
  version: 1,
  colors: {
    primary: "#2563eb", // Blue 600
    secondary: "#64748b", // Slate 500
    accent: "#0891b2", // Cyan 600
    background: "#ffffff",
    backgroundAlt: "#f8fafc", // Slate 50
    text: "#0f172a", // Slate 900
    textMuted: "#64748b", // Slate 500
    border: "#e2e8f0", // Slate 200
  },
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
    order: [
      "basics",
      "summary",
      "work",
      "education",
      "skills",
      "projects",
      "certificates",
      "languages",
    ],
    visible: [
      "basics",
      "summary",
      "work",
      "education",
      "skills",
      "projects",
      "languages",
    ],
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
};
