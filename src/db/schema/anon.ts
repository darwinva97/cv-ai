import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";

/**
 * Registro de generaciones gratuitas anónimas (flujo /probar) para limitar el
 * abuso por IP (backstop del límite por cookie). Se guarda un hash de la IP, no
 * la IP en claro. Activar con `pnpm db:push`.
 */
export const anonGeneration = pgTable(
  "anon_generation",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ipHash: text("ip_hash").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("anon_generation_ip_created").on(table.ipHash, table.createdAt)]
);
