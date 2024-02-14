/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    env: {
      SLACK_WEBHOOK_URL: "dummy",
      CLOUDFLARE_BUCKET_NAME: "dummy",
      CLOUDFLARE_ACCOUNT_ID: "dummy",
      CLOUDFLARE_ACCESS_KEY_ID: "dummy",
      CLOUDFLARE_SECRET_ACCESS_KEY: "dummy",
      SENTRY_DSN: "dummy",
    },
  },
});
