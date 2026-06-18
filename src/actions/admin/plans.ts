"use server";

import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { plan } from "@/db/schema/billing";
import { requireAdmin } from "@/lib/auth-helpers";

/** Admin CRUD for subscription plan definitions (monthly credit bags). */

export async function listPlans() {
  await requireAdmin();
  return db.select().from(plan).orderBy(desc(plan.createdAt));
}

export interface PlanInput {
  name: string;
  description?: string;
  monthlyCredits: number;
  priceCents?: number;
  currency?: string;
  isActive?: boolean;
}

export async function createPlan(input: PlanInput) {
  await requireAdmin();
  if (!input.name) throw new Error("name es obligatorio.");
  const [row] = await db
    .insert(plan)
    .values({
      name: input.name,
      description: input.description || null,
      monthlyCredits: input.monthlyCredits,
      priceCents: input.priceCents ?? 0,
      currency: input.currency ?? "USD",
      isActive: input.isActive ?? true,
    })
    .returning();
  return row;
}

export async function updatePlan(id: string, input: Partial<PlanInput>) {
  await requireAdmin();
  const [row] = await db
    .update(plan)
    .set(input)
    .where(eq(plan.id, id))
    .returning();
  return row;
}

export async function deletePlan(id: string): Promise<void> {
  await requireAdmin();
  await db.delete(plan).where(eq(plan.id, id));
}
