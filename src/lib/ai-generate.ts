import "server-only";
import { generateObject } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

/**
 * Core AI resume-generation logic.
 *
 * This module is provider-agnostic: it resolves the right Vercel AI SDK model
 * from a stored provider config and uses `generateObject` to produce a
 * structured, validated set of resume suggestions tailored to a job offer.
 *
 * It has NO database dependency so it can be unit-tested in isolation
 * (see scripts/test-gemini.ts).
 */

export type ProviderType = "anthropic" | "openai" | "google" | "other";

export interface ProviderConfig {
  providerAi: ProviderType;
  /** Model id, e.g. "gemini-2.5-flash", "gpt-4.1-mini", "claude-sonnet-4-5". */
  model: string;
  /** API key / token for the provider. */
  token: string;
  /** Optional base URL for OpenAI-compatible ("other") providers. */
  url?: string | null;
}

/** Resolve a stored provider config into a Vercel AI SDK language model. */
export function resolveModel(provider: ProviderConfig) {
  const { providerAi, model, token, url } = provider;

  switch (providerAi) {
    case "anthropic":
      return createAnthropic({ apiKey: token })(model);
    case "google":
      return createGoogleGenerativeAI({ apiKey: token })(model);
    case "openai":
      return createOpenAI({ apiKey: token })(model);
    case "other":
      // OpenAI-compatible endpoint (Groq, DeepSeek, OpenRouter, local, etc.)
      return createOpenAI({ apiKey: token, baseURL: url || undefined })(model);
    default:
      throw new Error(`Unsupported AI provider: ${providerAi as string}`);
  }
}

// ---- Output schema (subset aligned with the resume editor form) ----

const workSchema = z.object({
  name: z.string().describe("Company name"),
  position: z.string(),
  startDate: z.string().describe("ISO date or MM/YYYY, empty string if unknown"),
  endDate: z.string().describe("ISO date, MM/YYYY, 'Present', or empty string"),
  summary: z.string().describe("1-2 sentence role summary"),
  highlights: z.array(z.string()).describe("Bullet achievements, action + impact"),
});

const educationSchema = z.object({
  institution: z.string(),
  area: z.string().describe("Field of study"),
  studyType: z.string().describe("Degree type, e.g. Bachelor"),
  startDate: z.string(),
  endDate: z.string(),
});

const skillSchema = z.object({
  name: z.string(),
  level: z.string().describe("e.g. Beginner, Intermediate, Advanced, Expert"),
  keywords: z.array(z.string()),
});

export const generatedResumeSchema = z.object({
  summary: z.string().describe("Optimized professional summary, 2-4 sentences"),
  work: z.array(workSchema),
  education: z.array(educationSchema),
  skills: z.array(skillSchema),
});

export type GeneratedResume = z.infer<typeof generatedResumeSchema>;

/** Normalized token usage from the AI SDK (fields are best-effort per provider). */
export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface GenerateResult {
  object: GeneratedResume;
  usage: TokenUsage;
}

// ---- Input context ----

export interface GenerateInput {
  provider: ProviderConfig;
  /** Free-form user instructions, e.g. "emphasize React and leadership". */
  prompt?: string;
  /** Job offer description to tailor the resume toward. */
  jobOffer?: string;
  /** Current resume content used as the base to rewrite/optimize. */
  current: {
    summary?: string;
    work?: Array<Partial<z.infer<typeof workSchema>>>;
    education?: Array<Partial<z.infer<typeof educationSchema>>>;
    skills?: Array<Partial<z.infer<typeof skillSchema>>>;
  };
  /**
   * Fields the user pinned and the AI must NOT alter (only basics-level here,
   * e.g. ["summary"]). Pinned values are preserved server-side after generation.
   */
  pinnedBasics?: string[];
  /**
   * Qué tan agresivamente optimizar para la oferta, 1-10.
   * 1-3 = conservador (no inventa nada, solo reescribe/reordena);
   * 4-7 = equilibrado (no inventa empleadores/títulos/fechas, pero refuerza y
   *        añade skills/keywords plausibles alineados a la oferta);
   * 8-10 = agresivo (puede embellecer y extrapolar experiencia plausible).
   * Por defecto conservador.
   */
  creativity?: number;
}

/** Instrucción de creatividad según el nivel 1-10 (default conservador). */
function creativityGuidance(level?: number): string {
  const n = Math.min(10, Math.max(1, Math.round(level ?? 1)));
  if (n <= 3) {
    return `Creativity level ${n}/10 (conservative): Do NOT invent anything. Keep every employer, job title, degree and date exactly as provided. Only rephrase, reorder and sharpen wording for clarity and impact.`;
  }
  if (n <= 7) {
    return `Creativity level ${n}/10 (balanced): Stay truthful — never invent employers, degrees or dates. You MAY add plausible, relevant skills/keywords, emphasize achievements that match the target offer, and rephrase responsibilities using the offer's language to make the profile more attractive.`;
  }
  return `Creativity level ${n}/10 (aggressive): Optimize strongly for the target offer. You MAY embellish and extrapolate plausible experience, responsibilities and skills that fit the role, and adjust emphasis heavily. Avoid impossible claims (e.g. contradictory or future dates), but you may go beyond the literal source to maximize fit. The user has explicitly opted into this.`;
}

const SYSTEM_PROMPT = `You are an expert resume writer and career coach.
You rewrite and optimize resumes to fit a specific job offer. How truthful vs.
embellished to be is governed strictly by the creativity guidance provided
below — follow it. You may rephrase, reorder, quantify and sharpen wording.
Write in the same language as the candidate's current content (default Spanish
if ambiguous). Return only the structured object.`;

function buildUserPrompt(input: GenerateInput): string {
  const { prompt, jobOffer, current } = input;
  return [
    "## Current resume content (source of truth — do not fabricate beyond this):",
    JSON.stringify(current, null, 2),
    jobOffer ? `\n## Target job offer:\n${jobOffer}` : "",
    prompt ? `\n## Extra instructions from the candidate:\n${prompt}` : "",
    input.pinnedBasics?.length
      ? `\n## Do NOT change these basics fields (keep them as-is): ${input.pinnedBasics.join(", ")}`
      : "",
    "\n## Task: Produce an optimized version of the resume tailored to the job offer.",
  ]
    .filter(Boolean)
    .join("\n");
}

// ---- Resume extraction from a file (image or PDF) ----

const extractedBasicsSchema = z.object({
  name: z.string().describe("Full name, empty string if not found"),
  label: z.string().describe("Professional title / role, e.g. 'Desarrollador Full Stack'"),
  email: z.string(),
  phone: z.string(),
  location: z.string().describe("City, country"),
  website: z.string(),
  linkedin: z.string().describe("LinkedIn URL or username"),
  github: z.string().describe("GitHub URL or username"),
});

const extractedWorkSchema = z.object({
  company: z.string(),
  position: z.string(),
  startDate: z.string().describe("MM/YYYY or empty string"),
  endDate: z.string().describe("MM/YYYY, 'Present', or empty string"),
  description: z.string().describe("Role description / achievements"),
});

const extractedEducationSchema = z.object({
  institution: z.string(),
  degree: z.string().describe("Degree type, e.g. Bachelor"),
  field: z.string().describe("Field of study"),
  startDate: z.string(),
  endDate: z.string(),
  gpa: z.string().describe("GPA/score if present, else empty string"),
});

export const extractedResumeSchema = z.object({
  basics: extractedBasicsSchema,
  summary: z.string().describe("Professional summary, empty string if none"),
  work: z.array(extractedWorkSchema),
  education: z.array(extractedEducationSchema),
  skills: z.array(z.string()).describe("Individual skill names"),
});

export type ExtractedResume = z.infer<typeof extractedResumeSchema>;

export interface ExtractResult {
  object: ExtractedResume;
  usage: TokenUsage;
}

const EXTRACT_SYSTEM_PROMPT = `You are an expert resume parser. Extract the
candidate's information from the provided resume (image or PDF) into the given
structured schema. Never invent data: if a field is missing, return an empty
string (or empty array). Keep the original language of the content. Preserve
dates as written (prefer MM/YYYY). Extract every work and education entry.`;

/**
 * Extract structured resume data from a file (image or PDF) using a vision /
 * document-capable model. `file.data` is base64 (no data: prefix).
 */
export async function extractResumeFromFile(input: {
  provider: ProviderConfig;
  file: { data: string; mediaType: string };
}): Promise<ExtractResult> {
  const model = resolveModel(input.provider);
  const isPdf = input.file.mediaType === "application/pdf";

  const filePart = isPdf
    ? {
        type: "file" as const,
        data: input.file.data,
        mediaType: input.file.mediaType,
      }
    : {
        // Image part: pass a data URL so the media type is unambiguous.
        type: "image" as const,
        image: `data:${input.file.mediaType};base64,${input.file.data}`,
      };

  const { object, usage } = await generateObject({
    model,
    schema: extractedResumeSchema,
    system: EXTRACT_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          filePart,
          { type: "text", text: "Extract this resume into the schema." },
        ],
      },
    ],
  });

  return {
    object,
    usage: {
      inputTokens: usage?.inputTokens ?? 0,
      outputTokens: usage?.outputTokens ?? 0,
      totalTokens:
        usage?.totalTokens ??
        (usage?.inputTokens ?? 0) + (usage?.outputTokens ?? 0),
    },
  };
}

/**
 * Generate optimized resume content. Returns validated suggestions that the
 * caller can apply to the editor form (the user reviews and saves).
 */
export async function generateResumeContent(
  input: GenerateInput
): Promise<GenerateResult> {
  const model = resolveModel(input.provider);

  const { object, usage } = await generateObject({
    model,
    schema: generatedResumeSchema,
    system: `${SYSTEM_PROMPT}\n\n${creativityGuidance(input.creativity)}`,
    prompt: buildUserPrompt(input),
  });

  // Defensively preserve pinned basics (summary is the only basics field here).
  if (input.pinnedBasics?.includes("summary") && input.current.summary) {
    object.summary = input.current.summary;
  }

  return {
    object,
    usage: {
      inputTokens: usage?.inputTokens ?? 0,
      outputTokens: usage?.outputTokens ?? 0,
      totalTokens:
        usage?.totalTokens ??
        (usage?.inputTokens ?? 0) + (usage?.outputTokens ?? 0),
    },
  };
}
