import * as v from "valibot";
import { authorize } from "../shared/auth-client";
import { putMp3 } from "../shared/r2-client";
import { record } from "../shared/record";
import { sendMessageToSlack } from "../shared/slack-client";
import { convertEvent } from "./convert";

export async function main(cronEvent: unknown): Promise<void> {
  const result = v.safeParse(CronEventSchema, cronEvent);
  if (!result.success) {
    console.error(result.issues);
    throw new Error("cron event is not valid");
  }

  try {
    const program = convertEvent(result.output);
    const authToken = await authorize();
    await record(program, authToken);
    await putMp3(program.outputFileName);
  } catch (err) {
    if (err instanceof Error) {
      await sendMessageToSlack(err.message, {
        title: result.output.title,
        personality: result.output.personality,
      });
    }
    throw err;
  }
}

const TimeSchema = v.object({
  hour: v.number(),
  min: v.number(),
});

const CronEventSchema = v.object({
  title: v.string(),
  stationId: v.string(),
  personality: v.string(),
  from: TimeSchema,
  to: TimeSchema,
});
