import { pgTable, text, timestamp, jsonb, uuid, serial, customType, foreignKey, boolean, primaryKey, unique } from "drizzle-orm/pg-core";
import { user } from "@/db/schema";
import { ai } from "./ai";

const ltree = customType<{ data: string }>({
  dataType() {
    return "ltree";
  },
});

// Resume principal
export const resume = pgTable("resume", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  slug: text("slug").unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  currentVersionId: ltree("current_version_id"),
});

export const resumeVersion = pgTable("resume_version", {
  id: ltree("id").notNull().primaryKey(),
  title: text("title"),
  description: text("description"),
  isCommunityPublic: boolean("is_community_public").default(true).notNull(),
  isResultPublic: boolean("is_result_public").default(false).notNull(),
  thumbnailFilename: text("thumbnail_filename"),
  basedOn: ltree("based_on"),
  customSlug: text("custom_slug"),
  resumeId: uuid("resume_id")
    .notNull()
    .references(() => resume.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  prompt: text("prompt"), // Prompt utilizado para generar el CV
  jobOfferText: text("job_offer"), // Descripción de la oferta de trabajo
  jobOfferLink: text("job_offer_link"), // Link a la oferta de trabajo
  jobOfferLinkExtracted: text("job_offer_link_extracted"), // Texto extraído de la oferta de trabajo
  ai: uuid("ai")
    .references(() => ai.id, { onDelete: "cascade" }), // IA utilizada para generar el CV (si es que se generó con IA)
}, (table) => [
  unique().on(table.resumeId, table.customSlug),
  unique().on(table.resumeId, table.title),
  foreignKey({
    columns: [table.basedOn],
    foreignColumns: [table.id],
  }).onDelete("set null"),
  // Nota: La FK de resume.currentVersionId -> resumeVersion.id 
  // debe crearse manualmente en SQL debido a la dependencia circular
]);

export const resumeVersionPromptImage = pgTable("resume_version_prompt_image", {
  resumeVersionId: ltree("resume_version_id")
    .notNull()
    .references(() => resumeVersion.id, { onDelete: "cascade" }),
  promptImageFilename: text("prompt_image_filename").notNull(),
}, (table) => [
  primaryKey({ columns: [table.resumeVersionId, table.promptImageFilename] }),
]);

export const resumeVersionJobOfferImage = pgTable("resume_version_job_offer_image", {
  resumeVersionId: ltree("resume_version_id")
    .notNull()
    .references(() => resumeVersion.id, { onDelete: "cascade" }),
  jobOfferImageFilename: text("job_offer_image_filename").notNull(),
}, (table) => [
  primaryKey({ columns: [table.resumeVersionId, table.jobOfferImageFilename] }),
]);

export const resumeVersionBasic = pgTable("resume_version_basic", {
  resumeVersionId: ltree("resume_version_id")
    .notNull()
    .references(() => resumeVersion.id, { onDelete: "cascade" }),
  resumeBasicId: uuid("resume_basic_id")
    .notNull()
    .references(() => resumeBasics.id, { onDelete: "cascade" }),
}, (table) => [
  primaryKey({ columns: [table.resumeVersionId, table.resumeBasicId] }),
]);

export const resumeBasicImage = pgTable("resume_basic_image", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull().unique(),
}, table => [
  unique().on(table.userId, table.fileName),
]);

// Basics - Información básica
export const resumeBasics = pgTable("resume_basics", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  label: text("label"), // e.g. "Programmer"
  image: text("image_filename_or_url"), // URL o filename de la imagen
  email: text("email"),
  phone: text("phone"),
  url: text("url"),
  summary: text("summary"),
  // Location como JSONB
  location: jsonb("location").$type<{
    address?: string;
    postalCode?: string;
    city?: string;
    countryCode?: string;
    region?: string;
  }>(),
  // Campos de control de IA
  pinnedFields: jsonb("pinned_fields").$type<string[]>().default([]), // Campos que no pueden ser editados por IA
  aiModifiedFields: jsonb("ai_modified_fields").$type<string[]>().default([]), // Campos modificados por IA
});

export const resumeVersionProfile = pgTable("resume_version_profile", {
  resumeVersionId: ltree("resume_version_id")
    .notNull()
    .references(() => resumeVersion.id, { onDelete: "cascade" }),
  resumeProfileId: uuid("resume_profile_id")
    .notNull()
    .references(() => resumeProfile.id, { onDelete: "cascade" }),
}, (table) => [
  primaryKey({ columns: [table.resumeVersionId, table.resumeProfileId] }),
]);

// Profiles - Redes sociales
export const resumeProfile = pgTable("resume_profile", {
  id: uuid("id").defaultRandom().primaryKey(),
  network: text("network"), // e.g. "Twitter", "LinkedIn"
  username: text("username"),
  url: text("url"),
  pinnedFields: jsonb("pinned_fields").$type<string[]>().default([]),
  aiModifiedFields: jsonb("ai_modified_fields").$type<string[]>().default([]),
});

export const resumeVersionWork = pgTable("resume_version_work", {
  resumeVersionId: ltree("resume_version_id")
    .notNull()
    .references(() => resumeVersion.id, { onDelete: "cascade" }),
  resumeWorkId: uuid("resume_work_id")
    .notNull()
    .references(() => resumeWork.id, { onDelete: "cascade" }),
}, (table) => [
  primaryKey({ columns: [table.resumeVersionId, table.resumeWorkId] }),
]);

// Work - Experiencia laboral
export const resumeWork = pgTable("resume_work", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"), // Company name
  position: text("position"),
  url: text("url"),
  startDate: text("start_date"), // ISO 8601 date string
  endDate: text("end_date"),
  summary: text("summary"),
  highlights: jsonb("highlights").$type<string[]>(),
  pinnedFields: jsonb("pinned_fields").$type<string[]>().default([]),
  aiModifiedFields: jsonb("ai_modified_fields").$type<string[]>().default([]),
});

export const resumeVersionVolunteer = pgTable("resume_version_volunteer", {
  resumeVersionId: ltree("resume_version_id")
    .notNull()
    .references(() => resumeVersion.id, { onDelete: "cascade" }),
  resumeVolunteerId: uuid("resume_volunteer_id")
    .notNull()
    .references(() => resumeVolunteer.id, { onDelete: "cascade" }),
}, (table) => [
  primaryKey({ columns: [table.resumeVersionId, table.resumeVolunteerId] }),
]);

// Volunteer - Trabajo voluntario
export const resumeVolunteer = pgTable("resume_volunteer", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization: text("organization"),
  position: text("position"),
  url: text("url"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  summary: text("summary"),
  highlights: jsonb("highlights").$type<string[]>(),
  pinnedFields: jsonb("pinned_fields").$type<string[]>().default([]),
  aiModifiedFields: jsonb("ai_modified_fields").$type<string[]>().default([]),
});

export const resumeVersionEducation = pgTable("resume_version_education", {
  resumeVersionId: ltree("resume_version_id")
    .notNull()
    .references(() => resumeVersion.id, { onDelete: "cascade" }),
  resumeEducationId: uuid("resume_education_id")
    .notNull()
    .references(() => resumeEducation.id, { onDelete: "cascade" }),
}, (table) => [
  primaryKey({ columns: [table.resumeVersionId, table.resumeEducationId] }),
]);

// Education - Educación
export const resumeEducation = pgTable("resume_education", {
  id: uuid("id").defaultRandom().primaryKey(),
  institution: text("institution"),
  url: text("url"),
  area: text("area"), // e.g. "Software Development"
  studyType: text("study_type"), // e.g. "Bachelor"
  startDate: text("start_date"),
  endDate: text("end_date"),
  score: text("score"),
  courses: jsonb("courses").$type<string[]>(),
  pinnedFields: jsonb("pinned_fields").$type<string[]>().default([]),
  aiModifiedFields: jsonb("ai_modified_fields").$type<string[]>().default([]),
});

export const resumeVersionAward = pgTable("resume_version_award", {
  resumeVersionId: ltree("resume_version_id")
    .notNull()
    .references(() => resumeVersion.id, { onDelete: "cascade" }),
  resumeAwardId: uuid("resume_award_id")
    .notNull()
    .references(() => resumeAward.id, { onDelete: "cascade" }),
}, (table) => [
  primaryKey({ columns: [table.resumeVersionId, table.resumeAwardId] }),
]);

// Awards - Premios
export const resumeAward = pgTable("resume_award", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title"),
  date: text("date"),
  awarder: text("awarder"),
  summary: text("summary"),
});

export const resumeVersionCertificate = pgTable("resume_version_certificate", {
  resumeVersionId: ltree("resume_version_id")
    .notNull()
    .references(() => resumeVersion.id, { onDelete: "cascade" }),
  resumeCertificateId: uuid("resume_certificate_id")
    .notNull()
    .references(() => resumeCertificate.id, { onDelete: "cascade" }),
}, (table) => [
  primaryKey({ columns: [table.resumeVersionId, table.resumeCertificateId] }),
]);

// Certificates - Certificados
export const resumeCertificate = pgTable("resume_certificate", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  date: text("date"),
  issuer: text("issuer"),
  url: text("url"),
});

export const resumeVersionPublication = pgTable("resume_version_publication", {
  resumeVersionId: ltree("resume_version_id")
    .notNull()
    .references(() => resumeVersion.id, { onDelete: "cascade" }),
  resumePublicationId: uuid("resume_publication_id")
    .notNull()
    .references(() => resumePublication.id, { onDelete: "cascade" }),
}, (table) => [
  primaryKey({ columns: [table.resumeVersionId, table.resumePublicationId] }),
]);

// Publications - Publicaciones
export const resumePublication = pgTable("resume_publication", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  publisher: text("publisher"),
  releaseDate: text("release_date"),
  url: text("url"),
  summary: text("summary"),
});

export const resumeVersionSkill = pgTable("resume_version_skill", {
  resumeVersionId: ltree("resume_version_id")
    .notNull()
    .references(() => resumeVersion.id, { onDelete: "cascade" }),
  resumeSkillId: uuid("resume_skill_id")
    .notNull()
    .references(() => resumeSkill.id, { onDelete: "cascade" }),
}, (table) => [
  primaryKey({ columns: [table.resumeVersionId, table.resumeSkillId] }),
]);

// Skills - Habilidades
export const resumeSkill = pgTable("resume_skill", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  level: text("level"), // e.g. "Master", "Intermediate"
  keywords: jsonb("keywords").$type<string[]>(),
  pinnedFields: jsonb("pinned_fields").$type<string[]>().default([]),
  aiModifiedFields: jsonb("ai_modified_fields").$type<string[]>().default([]),
});

export const resumeVersionLanguage = pgTable("resume_version_language", {
  resumeVersionId: ltree("resume_version_id")
    .notNull()
    .references(() => resumeVersion.id, { onDelete: "cascade" }),
  resumeLanguageId: uuid("resume_language_id")
    .notNull()
    .references(() => resumeLanguage.id, { onDelete: "cascade" }),
}, (table) => [
  primaryKey({ columns: [table.resumeVersionId, table.resumeLanguageId] }),
]);

// Languages - Idiomas
export const resumeLanguage = pgTable("resume_language", {
  id: uuid("id").defaultRandom().primaryKey(),
  language: text("language"),
  fluency: text("fluency"), // e.g. "Native speaker", "Fluent"
});

export const resumeVersionInterest = pgTable("resume_version_interest", {
  resumeVersionId: ltree("resume_version_id")
    .notNull()
    .references(() => resumeVersion.id, { onDelete: "cascade" }),
  resumeInterestId: uuid("resume_interest_id")
    .notNull()
    .references(() => resumeInterest.id, { onDelete: "cascade" }),
}, (table) => [
  primaryKey({ columns: [table.resumeVersionId, table.resumeInterestId] }),
]);

// Interests - Intereses
export const resumeInterest = pgTable("resume_interest", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  keywords: jsonb("keywords").$type<string[]>(),
});

export const resumeVersionReference = pgTable("resume_version_reference", {
  resumeVersionId: ltree("resume_version_id")
    .notNull()
    .references(() => resumeVersion.id, { onDelete: "cascade" }),
  resumeReferenceId: uuid("resume_reference_id")
    .notNull()
    .references(() => resumeReference.id, { onDelete: "cascade" }),
}, (table) => [
  primaryKey({ columns: [table.resumeVersionId, table.resumeReferenceId] }),
]);

// References - Referencias
export const resumeReference = pgTable("resume_reference", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  reference: text("reference"),
});

export const resumeVersionProject = pgTable("resume_version_project", {
  resumeVersionId: ltree("resume_version_id")
    .notNull()
    .references(() => resumeVersion.id, { onDelete: "cascade" }),
  resumeProjectId: uuid("resume_project_id")
    .notNull()
    .references(() => resumeProject.id, { onDelete: "cascade" }),
}, (table) => [
  primaryKey({ columns: [table.resumeVersionId, table.resumeProjectId] }),
]);

// Projects - Proyectos
export const resumeProject = pgTable("resume_project", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  description: text("description"),
  highlights: jsonb("highlights").$type<string[]>(),
  url: text("url"),
  keywords: jsonb("keywords").$type<string[]>(),
  roles: jsonb("roles").$type<string[]>(),
  entity: text("entity"), // Company/Organization
  type: text("type"), // e.g. "application", "website"
  pinnedFields: jsonb("pinned_fields").$type<string[]>().default([]),
  aiModifiedFields: jsonb("ai_modified_fields").$type<string[]>().default([]),
});
