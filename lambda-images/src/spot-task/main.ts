import * as v from "valibot";
import { authorize } from "../shared/auth-client";
import { putMedia } from "../shared/r2-client";
import { record } from "../shared/record";
import { sendMessageToSlack } from "../shared/slack-client";
import { convertEvent } from "./convert";

export async function main(event: unknown): Promise<void> {
  const isHeartbeat = v.safeParse(HeartbeatSchema, event);
  if (isHeartbeat.success) {
    return;
  }
  const result = v.safeParse(SpotTaskEventSchema, event);
  if (!result.success) {
    console.error(result.issues);
    throw new Error("spot task event is not valid");
  }
  try {
    const program = convertEvent(result.output);
    const authToken = await authorize();
    await record(program, authToken);
    await putMedia(program.outputFileName);
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

const HeartbeatSchema = v.object({
  type: v.literal("heartbeat"),
});

const DateTimeSchema = v.object({
  year: v.number(),
  month: v.number(),
  day: v.number(),
  hour: v.number(),
  min: v.number(),
});

const SpotTaskEventSchema = v.object({
  stationId: v.string(),
  title: v.string(),
  personality: v.string(),
  from: DateTimeSchema,
  to: DateTimeSchema,
});
