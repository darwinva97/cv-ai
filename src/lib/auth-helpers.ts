import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * Server-side auth helpers shared by server actions and route handlers.
 *
 * Admin gating uses better-auth's `admin` plugin: a user is an admin when
 * `user.role === "admin"`. Set it once for yourself via the admin plugin or
 * directly in the DB to bootstrap.
 */

export type SessionUser = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>["user"];

/** Current session user, or null if unauthenticated. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export function isAdmin(user: { role?: string | null } | null | undefined): boolean {
  return user?.role === "admin";
}

export class ForbiddenError extends Error {
  constructor(message = "forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/**
 * Throws if the caller is not an authenticated admin; otherwise returns the
 * admin user. Use at the top of every admin server action.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new ForbiddenError("No autenticado.");
  if (!isAdmin(user)) throw new ForbiddenError("Acceso restringido a administradores.");
  return user;
}
