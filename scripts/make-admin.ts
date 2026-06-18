/**
 * Promote a user to the admin role (better-auth `admin` plugin → user.role).
 * Idempotent.
 *
 * Run (needs a live DB):
 *   node --env-file=.env --experimental-strip-types scripts/make-admin.ts you@example.com
 *   # or via env: ADMIN_EMAIL=you@example.com node --env-file=.env ... scripts/make-admin.ts
 *
 * Pass --revoke to clear the role instead:
 *   node --env-file=.env --experimental-strip-types scripts/make-admin.ts you@example.com --revoke
 */
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Missing DATABASE_URL.");
  process.exit(1);
}

const args = process.argv.slice(2);
const revoke = args.includes("--revoke");
const email = (args.find((a) => !a.startsWith("--")) || process.env.ADMIN_EMAIL || "").trim();
if (!email) {
  console.error("Usage: make-admin.ts <email> [--revoke]");
  process.exit(1);
}

const sql = postgres(databaseUrl, { prepare: false });

async function main() {
  const role = revoke ? null : "admin";
  const rows = await sql`
    UPDATE "user" SET role = ${role} WHERE email = ${email} RETURNING id, email, role
  `;
  if (rows.length === 0) {
    console.error(`No user found with email ${email}.`);
    process.exitCode = 1;
    return;
  }
  console.log(`✓ ${rows[0].email} role -> ${rows[0].role ?? "(none)"}`);
}

main()
  .catch((err) => {
    console.error("make-admin failed:", err);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
