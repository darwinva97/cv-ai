"use server";

import { db } from "@/db";
import { ai } from "@/db/schema/ai";
import { eq, and, desc } from "drizzle-orm";

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
  providerAi: "anthropic" | "openai" | "other";
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
