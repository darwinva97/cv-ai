"use server";

import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { aiUsageLog } from "@/db/schema/billing";
import { requireAdmin } from "@/lib/auth-helpers";

/** Admin view of recent AI generations across all users (metering audit). */
export async function listUsage(limit = 100) {
  await requireAdmin();
  return db
    .select({
      id: aiUsageLog.id,
      userId: aiUsageLog.userId,
      userEmail: user.email,
      providerAi: aiUsageLog.providerAi,
      model: aiUsageLog.model,
      source: aiUsageLog.source,
      systemKeyId: aiUsageLog.systemKeyId,
      inputTokens: aiUsageLog.inputTokens,
      outputTokens: aiUsageLog.outputTokens,
      creditsCharged: aiUsageLog.creditsCharged,
      status: aiUsageLog.status,
      createdAt: aiUsageLog.createdAt,
    })
    .from(aiUsageLog)
    .leftJoin(user, eq(user.id, aiUsageLog.userId))
    .orderBy(desc(aiUsageLog.createdAt))
    .limit(limit);
}
