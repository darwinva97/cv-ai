import { pgTable, text, timestamp, boolean, uuid, pgEnum } from "drizzle-orm/pg-core";
import { user } from "./auth";

// typeAi: anthropic, openai, google (gemini), other (OpenAI-compatible)
const PROVIDERS = ["anthropic", "openai", "google", "other"] as const;
export const providerAi = pgEnum("provider_ai", PROVIDERS);

export const ai = pgTable("ai", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  model: text("model").notNull(),
  token: text("token").notNull(),
  url: text("url"),
  providerAi: providerAi("provider_ai").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
