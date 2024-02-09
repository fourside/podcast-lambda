import type {
  APIGatewayEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import * as v from "valibot";
import { authorize } from "../../shared/auth-client";
import { putMp3 } from "../../shared/r2-client";
import { convertEvent } from "./convert";
import { record } from "./record";

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

    console.log("parsed", result.output);
    const program = convertEvent(result.output);
    console.log("converted", program);
    const authToken = await authorize();
    console.log("authed", authToken);
    await record(program, authToken);
    console.log("recorded");
    await putMp3(program.title);
    console.log("put");
  } catch (err) {
    console.error(err);
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
