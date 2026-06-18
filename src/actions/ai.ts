"use server";

import { headers } from "next/headers";
import { db } from "@/db";
import { ai } from "@/db/schema/ai";
import { aiUsageLog } from "@/db/schema/billing";
import { systemAiKey } from "@/db/schema/system-key";
import { eq, and, desc, asc, or, isNull, lte } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { getVersionData } from "@/actions/resume";
import {
  generateResumeContent,
  type GeneratedResume,
  type GenerateInput,
  type ProviderType,
} from "@/lib/ai-generate";
import {
  CreditError,
  estimateCost,
  getPricing,
  priceOf,
  reconcileCharge,
  refundReservation,
  reserveCredits,
  getBillingSummary,
} from "@/lib/credits";
import { runWithSystemKey } from "@/lib/system-keys";

export type GenerateResultPayload =
  | {
      ok: true;
      data: GeneratedResume;
      charged: number;
      source: "byok" | "system";
      remaining: number;
    }
  | {
      ok: false;
      code:
        | "unauthenticated"
        | "no_system_key"
        | "no_pricing"
        | "insufficient_credits"
        | "generation_failed";
      error: string;
      balance?: number;
      estCost?: number;
    };

export async function getAIProviders(userId: string) {
  const providers = await db
    .select()
    .from(ai)
    .where(eq(ai.userId, userId))
    .orderBy(desc(ai.createdAt));

  return providers;
}

export async function getActiveAIProvider(userId: string) {
  const [provider] = await db
    .select()
    .from(ai)
    .where(and(eq(ai.userId, userId), eq(ai.isActive, true)))
    .limit(1);

  return provider;
}

export async function createAIProvider(data: {
  userId: string;
  name: string;
  model: string;
  token: string;
  url?: string;
  providerAi: ProviderType;
}) {
  // Deactivate all other providers first
  await db
    .update(ai)
    .set({ isActive: false })
    .where(eq(ai.userId, data.userId));

  const [provider] = await db
    .insert(ai)
    .values({
      userId: data.userId,
      name: data.name,
      model: data.model,
      token: data.token,
      url: data.url,
      providerAi: data.providerAi,
      isActive: true,
    })
    .returning();

  return provider;
}

export async function updateAIProvider(
  id: string,
  userId: string,
  data: {
    name?: string;
    model?: string;
    token?: string;
    url?: string;
    isActive?: boolean;
  }
) {
  // If setting as active, deactivate others first
  if (data.isActive) {
    await db
      .update(ai)
      .set({ isActive: false })
      .where(eq(ai.userId, userId));
  }

  const [updated] = await db
    .update(ai)
    .set(data)
    .where(and(eq(ai.id, id), eq(ai.userId, userId)))
    .returning();

  return updated;
}

export async function deleteAIProvider(id: string, userId: string) {
  await db.delete(ai).where(and(eq(ai.id, id), eq(ai.userId, userId)));
}

/** Build the provider-independent parts of the generation input from version data. */
function buildGenerateParts(
  current: Awaited<ReturnType<typeof getVersionData>>,
  opts: { prompt?: string; jobOffer?: string }
): Omit<GenerateInput, "provider"> {
  return {
    prompt: opts.prompt,
    jobOffer: opts.jobOffer,
    current: {
      summary: current.basics?.summary ?? undefined,
      work: (current.work ?? []).map((w) => ({
        name: w.name ?? "",
        position: w.position ?? "",
        startDate: w.startDate ?? "",
        endDate: w.endDate ?? "",
        summary: w.summary ?? "",
        highlights: w.highlights ?? [],
      })),
      education: (current.education ?? []).map((e) => ({
        institution: e.institution ?? "",
        area: e.area ?? "",
        studyType: e.studyType ?? "",
        startDate: e.startDate ?? "",
        endDate: e.endDate ?? "",
      })),
      skills: (current.skills ?? []).map((s) => ({
        name: s.name ?? "",
        level: s.level ?? "",
        keywords: s.keywords ?? [],
      })),
    },
    pinnedBasics: current.basics?.pinnedFields ?? [],
  };
}

/** The default (provider, model) the system pool serves, by key priority. */
async function getDefaultSystemTarget(): Promise<{ providerAi: string; model: string } | null> {
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

/**
 * Generate optimized resume content for a version.
 *
 * Resolution: a user's own active key (BYOK) runs free; otherwise the platform
 * key pool runs the call and credits are metered/charged. Returns suggestions
 * for the editor to apply (nothing is persisted to the resume).
 */
export async function generateVersionContent(
  versionId: string,
  opts: { prompt?: string; jobOffer?: string }
): Promise<GenerateResultPayload> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return { ok: false, code: "unauthenticated", error: "No autenticado." };
  }
  const userId = session.user.id;

  const current = await getVersionData(versionId);
  const parts = buildGenerateParts(current, opts);

  // ---- BYOK: user's own active key → free, no credits ----
  const ownKey = await getActiveAIProvider(userId);
  if (ownKey) {
    try {
      const { object, usage } = await generateResumeContent({
        provider: {
          providerAi: ownKey.providerAi as ProviderType,
          model: ownKey.model,
          token: ownKey.token,
          url: ownKey.url,
        },
        ...parts,
      });
      await db.insert(aiUsageLog).values({
        userId,
        versionId,
        providerAi: ownKey.providerAi,
        model: ownKey.model,
        source: "user_key",
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        creditsCharged: 0,
        status: "success",
      });
      const summary = await getBillingSummary(userId);
      return { ok: true, data: object, charged: 0, source: "byok", remaining: summary.total };
    } catch (err) {
      console.error("BYOK generation failed:", err);
      await db.insert(aiUsageLog).values({
        userId,
        versionId,
        providerAi: ownKey.providerAi,
        model: ownKey.model,
        source: "user_key",
        creditsCharged: 0,
        status: "failed",
      });
      return {
        ok: false,
        code: "generation_failed",
        error: err instanceof Error ? `La generación falló: ${err.message}` : "La generación con IA falló.",
      };
    }
  }

  // ---- System key + credits ----
  const target = await getDefaultSystemTarget();
  if (!target) {
    return {
      ok: false,
      code: "no_system_key",
      error: "No hay un modelo del sistema disponible. Configura tu propia API key en Ajustes → IA.",
    };
  }

  const pricing = await getPricing(target.providerAi, target.model);
  if (!pricing) {
    return {
      ok: false,
      code: "no_pricing",
      error: "El modelo del sistema no tiene tarifa configurada. Contacta al administrador.",
    };
  }

  const promptChars = JSON.stringify(parts).length;
  const estCost = estimateCost(pricing, promptChars);

  // Reserve credits BEFORE the AI call (no call happens if funds are insufficient).
  let reservation;
  try {
    reservation = await reserveCredits(userId, target.providerAi, target.model, estCost);
  } catch (err) {
    if (err instanceof CreditError && err.code === "insufficient_credits") {
      return {
        ok: false,
        code: "insufficient_credits",
        error: "No tienes créditos suficientes. Compra créditos, suscríbete, o usa tu propia API key.",
        balance: err.balance,
        estCost: err.estCost,
      };
    }
    throw err;
  }

  try {
    const { result, keyId } = await runWithSystemKey(target.providerAi, target.model, (key) =>
      generateResumeContent({
        provider: {
          providerAi: key.providerAi as ProviderType,
          model: key.model,
          token: key.token,
          url: key.url,
        },
        ...parts,
      })
    );
    const { object, usage } = result;
    const actualCost = priceOf(pricing, usage);

    const [log] = await db
      .insert(aiUsageLog)
      .values({
        userId,
        versionId,
        providerAi: target.providerAi as never,
        model: target.model,
        source: "system_key",
        systemKeyId: keyId,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        creditsCharged: actualCost,
        status: "success",
      })
      .returning();

    const { creditsCharged, remaining } = await reconcileCharge(userId, reservation, actualCost, log.id);
    return { ok: true, data: object, charged: creditsCharged, source: "system", remaining };
  } catch (err) {
    console.error("System generation failed, refunding:", err);
    await refundReservation(userId, reservation);
    await db.insert(aiUsageLog).values({
      userId,
      versionId,
      providerAi: target.providerAi as never,
      model: target.model,
      source: "system_key",
      creditsCharged: 0,
      status: "failed",
    });
    return {
      ok: false,
      code: "generation_failed",
      error: err instanceof Error ? `La generación falló: ${err.message}` : "La generación con IA falló.",
    };
  }
}
