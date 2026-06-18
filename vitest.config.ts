import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Node-env unit tests for the server libraries. `@/` is mapped to ./src and
// `server-only` to a no-op shim (Next provides it only at build time).
// Dummy env values let server modules import without a live DB/secrets.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(new URL("./test/shims/server-only.ts", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    env: {
      DATABASE_URL: "postgresql://u:p@localhost:5432/test",
      // 32 zero-ish bytes, base64 — test-only key.
      MASTER_ENCRYPTION_KEY: "AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQE=",
      LEMONSQUEEZY_API_KEY: "test_api_key",
      LEMONSQUEEZY_STORE_ID: "1",
      LEMONSQUEEZY_WEBHOOK_SECRET: "test_webhook_secret",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    },
  },
});
