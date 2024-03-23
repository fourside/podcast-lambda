import * as v from "valibot";
import { authorize } from "./auth-client";
import { clearRecordingSpace } from "./clear-recording-space";
import { convertCronEvent, convertSpotTaskEvent } from "./convert";
import { checkIfDurationIsShort } from "./duration-cheker";
import { putMedia } from "./r2-client";
import { record } from "./record";
import { sendMessageToSlack } from "./slack-client";
import type { CronEvent, SpotTaskEvent } from "./type";

export async function main(event: unknown): Promise<void> {
  const result = v.safeParse(EventSchema, event);
  if (!result.success) {
    console.error(JSON.stringify(result.issues, null, 2));
    throw new Error("event is not valid");
  }
  if (result.output.type === "cron") {
    await cron(result.output);
  } else if (result.output.type === "spot-task") {
    await spotTask(result.output);
  }
}

async function cron(event: CronEvent): Promise<void> {
  try {
    const program = convertCronEvent(event);
    const authToken = await authorize();
    await record(program, authToken);
    await putMedia(program.outputFileName);
    await checkIfDurationIsShort(
      program.outputFileName,
      program.fromTime,
      program.toTime,
    );
  } catch (err) {
    if (err instanceof Error) {
      await sendMessageToSlack(err.message, {
        title: event.title,
        personality: event.personality,
      });
    }
    throw err;
  }
}

async function spotTask(event: SpotTaskEvent): Promise<void> {
  try {
    const program = convertSpotTaskEvent(event);
    const authToken = await authorize();
    await clearRecordingSpace();
    await record(program, authToken);
    await putMedia(program.outputFileName);
    await checkIfDurationIsShort(
      program.outputFileName,
      program.fromTime,
      program.toTime,
    );
  } catch (err) {
    if (err instanceof Error) {
      await sendMessageToSlack(err.message, {
        title: event.title,
        personality: event.personality,
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
  type: v.literal("cron"),
  title: v.string(),
  stationId: v.string(),
  personality: v.string(),
  from: TimeSchema,
  to: TimeSchema,
});

const DateTimeSchema = v.object({
  year: v.number(),
  month: v.number(),
  day: v.number(),
  hour: v.number(),
  min: v.number(),
});

const SpotTaskEventSchema = v.object({
  type: v.literal("spot-task"),
  stationId: v.string(),
  title: v.string(),
  personality: v.string(),
  from: DateTimeSchema,
  to: DateTimeSchema,
});

const EventSchema = v.variant("type", [CronEventSchema, SpotTaskEventSchema]);
