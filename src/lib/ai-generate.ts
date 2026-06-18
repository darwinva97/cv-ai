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
}

const SYSTEM_PROMPT = `You are an expert resume writer and career coach.
You rewrite and optimize resumes so they are tailored to a specific job offer
while staying strictly truthful — never invent employers, degrees, or dates
that are not present in the candidate's current data. You may rephrase, reorder,
quantify and sharpen wording. Keep dates exactly as provided unless empty.
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
    system: SYSTEM_PROMPT,
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
