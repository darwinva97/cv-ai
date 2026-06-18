import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  uuid,
  jsonb,
  pgEnum,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { providerAi } from "./ai";
import { systemAiKey } from "./system-key";

// ---- Enums ----
export const creditTxnKind = pgEnum("credit_txn_kind", [
  "subscription_grant",
  "purchase",
  "debit",
  "refund",
  "expiration",
  "admin_adjust",
]);

export const subscriptionStatus = pgEnum("subscription_status", [
  "active",
  "canceled",
  "expired",
  "past_due",
]);

export const aiUsageSource = pgEnum("ai_usage_source", ["user_key", "system_key"]);

// ---- billing_account: one row per user; materialized balance + lock target ----
export const billingAccount = pgTable("billing_account", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  // Credits granted by a subscription; expire at period end. Spent first.
  expiringBalance: integer("expiring_balance").notNull().default(0),
  // Purchased packs / admin grants; never expire.
  nonExpiringBalance: integer("non_expiring_balance").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---- model_pricing: admin-managed cost per (provider, model) ----
export const modelPricing = pgTable(
  "model_pricing",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    providerAi: providerAi("provider_ai").notNull(),
    model: text("model").notNull(),
    baseCredits: integer("base_credits").notNull().default(0), // flat per generation
    inputCreditsPer1k: integer("input_credits_per_1k").notNull().default(0),
    outputCreditsPer1k: integer("output_credits_per_1k").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [unique("model_pricing_provider_model").on(table.providerAi, table.model)]
);

// ---- plan: subscription plan definitions ----
export const plan = pgTable("plan", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  monthlyCredits: integer("monthly_credits").notNull(), // granted each period (expiring)
  priceCents: integer("price_cents").notNull().default(0), // display only for now
  currency: text("currency").notNull().default("USD"),
  externalProvider: text("external_provider"), // payment seam
  externalId: text("external_id"), // payment seam (price/product id)
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---- credit_pack: one-time purchasable bundles of non-expiring credits ----
export const creditPack = pgTable("credit_pack", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  credits: integer("credits").notNull(), // granted as non-expiring on purchase
  priceCents: integer("price_cents").notNull().default(0), // display + checkout amount
  currency: text("currency").notNull().default("USD"),
  externalProvider: text("external_provider"), // payment seam (e.g. "lemonsqueezy")
  externalId: text("external_id"), // gateway variant/price id (e.g. LS variant id)
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---- subscription: user <-> plan ----
export const subscription = pgTable(
  "subscription",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    planId: uuid("plan_id")
      .notNull()
      .references(() => plan.id, { onDelete: "restrict" }),
    status: subscriptionStatus("status").notNull().default("active"),
    currentPeriodStart: timestamp("current_period_start").notNull(),
    currentPeriodEnd: timestamp("current_period_end").notNull(),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
    externalProvider: text("external_provider"), // payment seam
    externalId: text("external_id"), // payment seam (provider subscription id)
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("subscription_user").on(table.userId),
    index("subscription_status_period").on(table.status, table.currentPeriodEnd),
  ]
);

// ---- ai_usage_log: one row per generation attempt that ran ----
export const aiUsageLog = pgTable(
  "ai_usage_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    versionId: text("version_id"), // soft reference to resume version (ltree id)
    providerAi: providerAi("provider_ai").notNull(),
    model: text("model").notNull(),
    source: aiUsageSource("source").notNull(),
    systemKeyId: uuid("system_key_id").references(() => systemAiKey.id, {
      onDelete: "set null",
    }),
    inputTokens: integer("input_tokens").notNull().default(0),
    outputTokens: integer("output_tokens").notNull().default(0),
    creditsCharged: integer("credits_charged").notNull().default(0),
    status: text("status").notNull().default("success"), // success | failed | refunded
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("ai_usage_log_user").on(table.userId, table.createdAt)]
);

// ---- credit_transaction: append-only ledger (source of truth) ----
export const creditTransaction = pgTable(
  "credit_transaction",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    kind: creditTxnKind("kind").notNull(),
    amount: integer("amount").notNull(), // signed: +grant/purchase/refund, -debit/expiration
    bucket: text("bucket").notNull().default("non_expiring"), // "expiring" | "non_expiring" | "mixed"
    balanceAfterExpiring: integer("balance_after_expiring"),
    balanceAfterNonExpiring: integer("balance_after_non_expiring"),
    expiresAt: timestamp("expires_at"), // set for subscription_grant rows
    remainingExpiring: integer("remaining_expiring"), // for grant rows: unspent portion (FIFO)
    source: text("source"), // admin | subscription_renewal | generation | generation_failed | ...
    externalProvider: text("external_provider"), // payment seam
    externalId: text("external_id"), // payment seam
    usageLogId: uuid("usage_log_id").references(() => aiUsageLog.id, {
      onDelete: "set null",
    }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("credit_txn_user_created").on(table.userId, table.createdAt),
    index("credit_txn_user_kind_expires").on(table.userId, table.kind, table.expiresAt),
  ]
);
