"use server";

import { eq, asc, desc } from "drizzle-orm";
import { db } from "@/db";
import { systemAiKey } from "@/db/schema/system-key";
import type { ProviderType } from "@/lib/ai-generate";
import { encryptSecret } from "@/lib/crypto";
import { requireAdmin } from "@/lib/auth-helpers";

/**
 * Admin CRUD for the platform-owned API key pool.
 * The encrypted token is NEVER selected or returned — list/get expose metadata
 * only. Tokens are encrypted (AES-256-GCM) on write inside this server module.
 */

// Columns safe to expose to the admin UI (no token).
const publicColumns = {
  id: systemAiKey.id,
  name: systemAiKey.name,
  providerAi: systemAiKey.providerAi,
  model: systemAiKey.model,
  url: systemAiKey.url,
  isActive: systemAiKey.isActive,
  weight: systemAiKey.weight,
  priority: systemAiKey.priority,
  disabledUntil: systemAiKey.disabledUntil,
  lastUsedAt: systemAiKey.lastUsedAt,
  failureCount: systemAiKey.failureCount,
  createdAt: systemAiKey.createdAt,
};

export type SystemKeyMeta = {
  id: string;
  name: string;
  providerAi: ProviderType;
  model: string;
  url: string | null;
  isActive: boolean;
  weight: number;
  priority: number;
  disabledUntil: Date | null;
  lastUsedAt: Date | null;
  failureCount: number;
  createdAt: Date;
};

export async function listSystemKeys(): Promise<SystemKeyMeta[]> {
  await requireAdmin();
  const rows = await db
    .select(publicColumns)
    .from(systemAiKey)
    .orderBy(asc(systemAiKey.priority), desc(systemAiKey.createdAt));
  return rows as SystemKeyMeta[];
}

export interface CreateSystemKeyInput {
  name: string;
  providerAi: ProviderType;
  model: string;
  token: string;
  url?: string;
  weight?: number;
  priority?: number;
  isActive?: boolean;
}

export async function createSystemKey(input: CreateSystemKeyInput): Promise<SystemKeyMeta> {
  await requireAdmin();
  if (!input.name || !input.model || !input.token) {
    throw new Error("name, model y token son obligatorios.");
  }
  const [row] = await db
    .insert(systemAiKey)
    .values({
      name: input.name,
      providerAi: input.providerAi,
      model: input.model,
      tokenEncrypted: encryptSecret(input.token),
      url: input.url || null,
      weight: input.weight ?? 1,
      priority: input.priority ?? 0,
      isActive: input.isActive ?? true,
    })
    .returning(publicColumns);
  return row as SystemKeyMeta;
}

export interface UpdateSystemKeyInput {
  name?: string;
  providerAi?: ProviderType;
  model?: string;
  /** New plaintext token; re-encrypted on write. Omit to keep the current one. */
  token?: string;
  url?: string | null;
  weight?: number;
  priority?: number;
  isActive?: boolean;
}

export async function updateSystemKey(
  id: string,
  input: UpdateSystemKeyInput
): Promise<SystemKeyMeta> {
  await requireAdmin();
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.providerAi !== undefined) patch.providerAi = input.providerAi;
  if (input.model !== undefined) patch.model = input.model;
  if (input.url !== undefined) patch.url = input.url || null;
  if (input.weight !== undefined) patch.weight = input.weight;
  if (input.priority !== undefined) patch.priority = input.priority;
  if (input.isActive !== undefined) patch.isActive = input.isActive;
  if (input.token) patch.tokenEncrypted = encryptSecret(input.token);

  const [row] = await db
    .update(systemAiKey)
    .set(patch)
    .where(eq(systemAiKey.id, id))
    .returning(publicColumns);
  return row as SystemKeyMeta;
}

export async function deleteSystemKey(id: string): Promise<void> {
  await requireAdmin();
  await db.delete(systemAiKey).where(eq(systemAiKey.id, id));
}

/** Clear a key's failover cooldown and failure counter (after rotating it back in). */
export async function resetSystemKeyCooldown(id: string): Promise<SystemKeyMeta> {
  await requireAdmin();
  const [row] = await db
    .update(systemAiKey)
    .set({ disabledUntil: null, failureCount: 0 })
    .where(eq(systemAiKey.id, id))
    .returning(publicColumns);
  return row as SystemKeyMeta;
}
