"use server";

import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { creditPack } from "@/db/schema/billing";
import { requireAdmin } from "@/lib/auth-helpers";

/** Admin CRUD for one-time credit packs (non-expiring). externalId = gateway variant id. */

export async function listCreditPacks() {
  await requireAdmin();
  return db.select().from(creditPack).orderBy(desc(creditPack.createdAt));
}

export interface CreditPackInput {
  name: string;
  description?: string;
  credits: number;
  priceCents?: number;
  currency?: string;
  externalId?: string | null;
  isActive?: boolean;
}

export async function createCreditPack(input: CreditPackInput) {
  await requireAdmin();
  if (!input.name) throw new Error("name es obligatorio.");
  const [row] = await db
    .insert(creditPack)
    .values({
      name: input.name,
      description: input.description || null,
      credits: input.credits,
      priceCents: input.priceCents ?? 0,
      currency: input.currency ?? "USD",
      externalProvider: input.externalId ? "lemonsqueezy" : null,
      externalId: input.externalId || null,
      isActive: input.isActive ?? true,
    })
    .returning();
  return row;
}

export async function updateCreditPack(id: string, input: Partial<CreditPackInput>) {
  await requireAdmin();
  const patch: Record<string, unknown> = { ...input };
  if (input.externalId !== undefined) {
    patch.externalId = input.externalId || null;
    patch.externalProvider = input.externalId ? "lemonsqueezy" : null;
  }
  const [row] = await db
    .update(creditPack)
    .set(patch)
    .where(eq(creditPack.id, id))
    .returning();
  return row;
}

export async function deleteCreditPack(id: string): Promise<void> {
  await requireAdmin();
  await db.delete(creditPack).where(eq(creditPack.id, id));
}
