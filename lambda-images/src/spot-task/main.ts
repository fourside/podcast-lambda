import * as v from "valibot";
import { authorize } from "../shared/auth-client";
import { putMp3 } from "../shared/r2-client";
import { record } from "../shared/record";
import { convertEvent } from "./convert";

export async function main(event: unknown): Promise<void> {
  const isEmpty = v.safeParse(EmptySchema, event);
  if (isEmpty.success) {
    return;
  }
  const result = v.safeParse(SpotTaskEventSchema, event);
  if (!result.success) {
    console.error(result.issues);
    throw new Error("cron event is not valid");
  }
  const program = convertEvent(result.output);
  const authToken = await authorize();
  await record(program, authToken);
  await putMp3(program.outputFileName);
}

const EmptySchema = v.object({});

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
