import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import { providerAi } from "./ai";

/**
 * Pool of platform-owned API keys (the owner's keys), per model.
 * Used internally for users who don't bring their own key. Tokens are stored
 * ENCRYPTED (AES-256-GCM via src/lib/crypto.ts) and never exposed to clients.
 */
export const systemAiKey = pgTable(
  "system_ai_key",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(), // admin label
    providerAi: providerAi("provider_ai").notNull(),
    model: text("model").notNull(), // pool is per (provider, model)
    tokenEncrypted: text("token_encrypted").notNull(), // AES-256-GCM ciphertext
    url: text("url"), // base URL for "other" providers
    isActive: boolean("is_active").notNull().default(true),
    weight: integer("weight").notNull().default(1), // weighted selection
    priority: integer("priority").notNull().default(0), // lower = preferred tier
    disabledUntil: timestamp("disabled_until"), // failover cooldown
    lastUsedAt: timestamp("last_used_at"), // for LRU rotation
    failureCount: integer("failure_count").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("system_ai_key_lookup").on(table.providerAi, table.model, table.isActive)]
);
