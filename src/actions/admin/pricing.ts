"use server";

import { eq, asc } from "drizzle-orm";
import { db } from "@/db";
import { modelPricing } from "@/db/schema/billing";
import type { ProviderType } from "@/lib/ai-generate";
import { requireAdmin } from "@/lib/auth-helpers";

/**
 * Admin CRUD for per-model credit pricing.
 * Cost of a generation = baseCredits + ceil(inTok/1k)*inputPer1k + ceil(outTok/1k)*outputPer1k.
 */

export async function listPricing() {
  await requireAdmin();
  return db
    .select()
    .from(modelPricing)
    .orderBy(asc(modelPricing.providerAi), asc(modelPricing.model));
}

export interface PricingInput {
  providerAi: ProviderType;
  model: string;
  baseCredits: number;
  inputCreditsPer1k: number;
  outputCreditsPer1k: number;
  isActive?: boolean;
}

export async function createPricing(input: PricingInput) {
  await requireAdmin();
  if (!input.model) throw new Error("model es obligatorio.");
  const [row] = await db
    .insert(modelPricing)
    .values({
      providerAi: input.providerAi,
      model: input.model,
      baseCredits: input.baseCredits,
      inputCreditsPer1k: input.inputCreditsPer1k,
      outputCreditsPer1k: input.outputCreditsPer1k,
      isActive: input.isActive ?? true,
    })
    .returning();
  return row;
}

export async function updatePricing(id: string, input: Partial<PricingInput>) {
  await requireAdmin();
  const [row] = await db
    .update(modelPricing)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(modelPricing.id, id))
    .returning();
  return row;
}

export async function deletePricing(id: string): Promise<void> {
  await requireAdmin();
  await db.delete(modelPricing).where(eq(modelPricing.id, id));
}
