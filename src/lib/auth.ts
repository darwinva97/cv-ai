import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { db } from "../db";
import * as schema from "../db/schema";

/**
 * Social providers are enabled only when their credentials are present in env,
 * so an unconfigured provider never breaks auth init. To enable Google:
 *   - Set GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET (local .env and Vercel).
 *   - Authorized redirect URI in Google Cloud Console:
 *       {BETTER_AUTH_URL}/api/auth/callback/google
 *     e.g. https://cv-ai-black.vercel.app/api/auth/callback/google
 *          http://localhost:3000/api/auth/callback/google
 */
const socialProviders: NonNullable<Parameters<typeof betterAuth>[0]["socialProviders"]> = {};

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  socialProviders.google = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  };
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  socialProviders.github = {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  };
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders,
  plugins: [admin()],
});

export type Session = typeof auth.$Infer.Session;

/** Provider keys with credentials configured — for the login UI to show only working buttons. */
export const enabledSocialProviders = Object.keys(socialProviders);
