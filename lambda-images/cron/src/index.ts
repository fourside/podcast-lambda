import * as Sentry from "@sentry/node";
import type {
  APIGatewayEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import * as v from "valibot";
import { authorize } from "../../shared/auth-client";
import { Env } from "../../shared/env";
import { putMp3 } from "../../shared/r2-client";
import { convertEvent } from "./convert";
import { record } from "./record";

Sentry.init({ dsn: Env.sentryDsn });

export const handler = async (
  event: APIGatewayEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  // console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  // console.log(`Context: ${JSON.stringify(context, null, 2)}`);

  try {
    console.log("start");
    const result = v.safeParse(CronEventSchema, event);
    if (!result.success) {
      console.error(result.issues);
      throw new Error("cron event is not valid");
    }

    const program = convertEvent(result.output);
    const authToken = await authorize();
    await record(program, authToken);
    await putMp3(program.outputFileName);
  } catch (err) {
    console.error(err);
    Sentry.captureException(err);
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: err instanceof Error ? err.message : "something wrong",
      }),
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "success",
    }),
  };
};

const CronEventSchema = v.object({
  title: v.string(),
  stationId: v.string(),
  personality: v.string(),
  from: v.object({
    hour: v.number(),
    min: v.number(),
  }),
  to: v.object({
    hour: v.number(),
    min: v.number(),
  }),
});
