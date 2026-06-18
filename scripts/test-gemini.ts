/**
 * Standalone smoke test for the AI resume generator using Google Gemini.
 *
 * It exercises the same flow as src/lib/ai-generate.ts (provider -> generateObject
 * with a Zod schema) but WITHOUT the database or Next.js, so you can verify the
 * Gemini integration and your API key in isolation.
 *
 * Run:
 *   GEMINI_API_KEY=xxxx pnpm dlx tsx scripts/test-gemini.ts
 *   # or:  GOOGLE_GENERATIVE_AI_API_KEY=xxxx pnpm dlx tsx scripts/test-gemini.ts
 *
 * Optionally set MODEL (default: gemini-2.5-flash).
 */
import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

const apiKey =
  process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!apiKey) {
  console.error(
    "Missing API key. Set GEMINI_API_KEY (or GOOGLE_GENERATIVE_AI_API_KEY)."
  );
  process.exit(1);
}

const modelId = process.env.MODEL || "gemini-2.5-flash";

const schema = z.object({
  summary: z.string(),
  work: z.array(
    z.object({
      name: z.string(),
      position: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      summary: z.string(),
      highlights: z.array(z.string()),
    })
  ),
  education: z.array(
    z.object({
      institution: z.string(),
      area: z.string(),
      studyType: z.string(),
      startDate: z.string(),
      endDate: z.string(),
    })
  ),
  skills: z.array(
    z.object({
      name: z.string(),
      level: z.string(),
      keywords: z.array(z.string()),
    })
  ),
});

const current = {
  summary: "Desarrollador con 3 años de experiencia en aplicaciones web.",
  work: [
    {
      name: "Acme Corp",
      position: "Frontend Developer",
      startDate: "2022-01",
      endDate: "Present",
      summary: "Mantenimiento de la plataforma web.",
      highlights: ["Migré la app a Next.js", "Reduje el bundle un 30%"],
    },
  ],
  education: [
    {
      institution: "Universidad Nacional",
      area: "Ingeniería de Software",
      studyType: "Bachelor",
      startDate: "2016",
      endDate: "2021",
    },
  ],
  skills: [{ name: "Frontend", level: "Advanced", keywords: ["React", "TypeScript"] }],
};

const jobOffer =
  "Buscamos Senior Frontend Engineer con experiencia en React, Next.js, " +
  "liderazgo técnico y optimización de rendimiento.";

async function main() {
  const google = createGoogleGenerativeAI({ apiKey });
  console.log(`> Generating with ${modelId}…\n`);

  const start = Date.now();
  const { object, usage } = await generateObject({
    model: google(modelId),
    schema,
    system:
      "You are an expert resume writer. Tailor the resume to the job offer, " +
      "stay truthful, keep dates, answer in Spanish. Return only the object.",
    prompt:
      "## Current resume:\n" +
      JSON.stringify(current, null, 2) +
      "\n\n## Job offer:\n" +
      jobOffer +
      "\n\n## Task: produce an optimized, tailored version.",
  });

  console.log(JSON.stringify(object, null, 2));
  console.log(`\n✓ OK in ${((Date.now() - start) / 1000).toFixed(1)}s`);
  if (usage) console.log("tokens:", usage);
}

main().catch((err) => {
  console.error("\n✗ Generation failed:", err);
  process.exit(1);
});
