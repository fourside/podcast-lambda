export const env = Object.freeze({
  SLACK_WEBHOOK_URL:
    process.env.SLACK_WEBHOOK_URL || unreachable("SLACK_WEBHOOK_URL"),
  CLOUDFLARE_BUCKET_NAME:
    process.env.CLOUDFLARE_BUCKET_NAME || unreachable("CLOUDFLARE_BUCKET_NAME"),
  CLOUDFLARE_ACCOUNT_ID:
    process.env.CLOUDFLARE_ACCOUNT_ID || unreachable("CLOUDFLARE_ACCOUNT_ID"),
  CLOUDFLARE_ACCESS_KEY_ID:
    process.env.CLOUDFLARE_ACCESS_KEY_ID ||
    unreachable("CLOUDFLARE_ACCESS_KEY_ID"),
  CLOUDFLARE_SECRET_ACCESS_KEY:
    process.env.CLOUDFLARE_SECRET_ACCESS_KEY ||
    unreachable("CLOUDFLARE_SECRET_ACCESS_KEY"),
  SENTRY_DSN: process.env.SENTRY_DSN || unreachable("SENTRY_DSN"),
});

function unreachable(name: string): never {
  throw new Error(`${name} is not set in environment variable`);
}
