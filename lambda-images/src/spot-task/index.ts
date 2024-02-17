import * as Sentry from "@sentry/node";
import type {
  APIGatewayEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { Env } from "../shared/env";
import { main } from "./main";

Sentry.init({ dsn: Env.sentryDsn });

export const handler = async (
  event: unknown,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  console.log("start", event, context);
  try {
    await main(event);
    console.log("done");
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
