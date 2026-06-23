"use server";

import { cookies } from "next/headers";
import { and, asc, eq, isNull, lte, or } from "drizzle-orm";
import { db } from "@/db";
import { systemAiKey } from "@/db/schema/system-key";
import { runWithSystemKey } from "@/lib/system-keys";
import {
  extractResumeFromFile,
  generateResumeContent,
  type ProviderType,
} from "@/lib/ai-generate";
import { fetchJobOfferText } from "@/lib/fetch-job-offer";
import { autoPickPreset, getPreset } from "@/lib/style-presets";
import type { Basics, Work, Education, Skill } from "@/types/resume";

const FREE_COOKIE = "cv_free_uses";
const BROWSER_DAILY_LIMIT = 3; // generaciones por navegador/día (cookie)

const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

export interface FreeResumeData {
  basics: Basics;
  work: Work[];
  education: Education[];
  skills: Skill[];
  languages: [];
  projects: [];
}

export type FreeGenPayload =
  | { ok: true; data: FreeResumeData; styleId: string }
  | {
      ok: false;
      code: "no_input" | "unsupported_type" | "rate_limited" | "no_system_key" | "failed";
      error: string;
    };

async function getDefaultSystemTarget() {
  const now = new Date();
  const [key] = await db
    .select({ providerAi: systemAiKey.providerAi, model: systemAiKey.model })
    .from(systemAiKey)
    .where(
      and(
        eq(systemAiKey.isActive, true),
        or(isNull(systemAiKey.disabledUntil), lte(systemAiKey.disabledUntil, now))
      )
    )
    .orderBy(asc(systemAiKey.priority), asc(systemAiKey.lastUsedAt))
    .limit(1);
  return key ?? null;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function generateFreeResume(input: {
  base64?: string;
  mediaType?: string;
  prompt?: string;
  jobOfferText?: string;
  jobOfferUrl?: string;
  creativity?: number;
  /** Cambiar el diseño elegido (no re-genera, solo fija el preset). */
  styleId?: string;
}): Promise<FreeGenPayload> {
  if (!input.base64 || !input.mediaType) {
    return { ok: false, code: "no_input", error: "Sube tu CV actual (PDF o imagen)." };
  }
  if (!ALLOWED_TYPES.has(input.mediaType)) {
    return {
      ok: false,
      code: "unsupported_type",
      error: "Formato no soportado. Usa una imagen (PNG/JPG/WEBP) o un PDF.",
    };
  }

  // ---- Límite por navegador (cookie) ----
  const jar = await cookies();
  const raw = jar.get(FREE_COOKIE)?.value || "";
  const [cookieDay, cookieCountStr] = raw.split(":");
  const usedToday = cookieDay === today() ? parseInt(cookieCountStr || "0", 10) || 0 : 0;
  if (usedToday >= BROWSER_DAILY_LIMIT) {
    return {
      ok: false,
      code: "rate_limited",
      error:
        "Alcanzaste el límite de pruebas gratis de hoy. Regístrate para seguir generando y guardar tu CV.",
    };
  }

  const target = await getDefaultSystemTarget();
  if (!target) {
    return {
      ok: false,
      code: "no_system_key",
      error: "El servicio de IA no está disponible por ahora. Inténtalo más tarde.",
    };
  }

  const jobOffer =
    input.jobOfferText?.trim() ||
    (input.jobOfferUrl ? (await fetchJobOfferText(input.jobOfferUrl)) ?? undefined : undefined);

  try {
    // 1) Extraer el CV del archivo.
    const { result: extracted } = await runWithSystemKey(
      target.providerAi,
      target.model,
      (key) =>
        extractResumeFromFile({
          provider: {
            providerAi: key.providerAi as ProviderType,
            model: key.model,
            token: key.token,
            url: key.url,
          },
          file: { data: input.base64!, mediaType: input.mediaType! },
        })
    );
    const ex = extracted.object;

    // 2) Optimizar/afinar con la oferta + nivel de creatividad.
    const { result: generated } = await runWithSystemKey(
      target.providerAi,
      target.model,
      (key) =>
        generateResumeContent({
          provider: {
            providerAi: key.providerAi as ProviderType,
            model: key.model,
            token: key.token,
            url: key.url,
          },
          prompt: input.prompt?.trim() || undefined,
          jobOffer,
          creativity: input.creativity,
          current: {
            summary: ex.summary || undefined,
            work: (ex.work || []).map((w) => ({
              name: w.company || "",
              position: w.position || "",
              startDate: w.startDate || "",
              endDate: w.endDate || "",
              summary: w.description || "",
              highlights: [],
            })),
            education: (ex.education || []).map((e) => ({
              institution: e.institution || "",
              area: e.field || "",
              studyType: e.degree || "",
              startDate: e.startDate || "",
              endDate: e.endDate || "",
            })),
            skills: (ex.skills || []).map((s) => ({ name: s, level: "", keywords: [] })),
          },
        })
    );
    const gen = generated.object;

    // 3) Combinar: contacto del archivo + contenido optimizado.
    const [city, country] = (ex.basics?.location || "").split(",").map((s) => s.trim());
    const basics: Basics = {
      name: ex.basics?.name || "",
      label: ex.basics?.label || "",
      email: ex.basics?.email || "",
      phone: ex.basics?.phone || "",
      url: ex.basics?.website || "",
      summary: gen.summary || ex.summary || "",
      location: { city: city || "", countryCode: country || "" },
    };
    const work: Work[] = gen.work.map((w) => ({
      name: w.name,
      position: w.position,
      startDate: w.startDate,
      endDate: w.endDate,
      summary: w.summary,
      highlights: w.highlights || [],
    }));
    const education: Education[] = gen.education.map((e) => ({
      institution: e.institution,
      area: e.area,
      studyType: e.studyType,
      startDate: e.startDate,
      endDate: e.endDate,
      courses: [],
    }));
    const skills: Skill[] = gen.skills.map((s) => ({
      name: s.name,
      level: s.level,
      keywords: s.keywords || [],
    }));

    // 4) Diseño: el elegido por el usuario, o auto-selección por rol/oferta.
    const preset = input.styleId
      ? getPreset(input.styleId)
      : autoPickPreset({ label: basics.label, jobOffer });

    // 5) Registrar uso (cookie) — solo tras éxito.
    jar.set(FREE_COOKIE, `${today()}:${usedToday + 1}`, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return {
      ok: true,
      data: { basics, work, education, skills, languages: [], projects: [] },
      styleId: preset.id,
    };
  } catch (err) {
    console.error("Free generation failed:", err);
    return {
      ok: false,
      code: "failed",
      error: "No se pudo generar el CV. Inténtalo de nuevo en un momento.",
    };
  }
}
