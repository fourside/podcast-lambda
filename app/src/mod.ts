import * as Sentry from "x/sentry";
import { z } from "x/zod";
import { authorize } from "./auth-client.ts";
import { convertEvent } from "./convert.ts";
import { Env } from "./env.ts";
import { record } from "./record.ts";

export async function handler(event: unknown) {
  Sentry.init({ dsn: Env.sentryDsn });
  try {
    await main(event);
  } catch (error) {
    Sentry.captureException(error);
    Deno.exit(-1);
  }

  return {
    statusCode: 200,
  };
}

async function main(event: unknown) {
  const result = podcastEventSchema.safeParse(event);
  if (!result.success) {
    throw new Error(); // TODO
  }
  const program = convertEvent(result.data);
  const authToken = await authorize();
  await record(program, authToken);
}

const podcastEventSchema = z.object({
  title: z.string(),
  stationId: z.string(),
  personality: z.string(),
  from: z.object({
    hour: z.number(),
    min: z.number(),
  }),
  to: z.object({
    hour: z.number(),
    min: z.number(),
  }),
});
