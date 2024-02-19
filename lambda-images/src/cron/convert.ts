import { isRecordable, subtractIfMidnight } from "../shared/date";
import { getOutputFilename } from "../shared/output-filename";
import type { CronEvent, Program } from "../shared/type";

export function convertEvent(event: CronEvent): Program {
  if (event.from.hour > event.to.hour) {
    throw new Error("converter not support over date program");
  }

  const from = new Date();
  from.setHours(event.from.hour);
  from.setMinutes(event.from.min);
  from.setSeconds(0);
  const fromRecordable = isRecordable(from);
  if (!fromRecordable.ok) {
    throw new Error(`from is invalid: ${fromRecordable.reason}`);
  }

  const to = new Date();
  to.setHours(event.to.hour);
  to.setMinutes(event.to.min);
  to.setSeconds(0);
  const toRecordable = isRecordable(to);
  if (!toRecordable.ok) {
    throw new Error(`to is invalid: ${toRecordable.reason}`);
  }

  const broadcastingDate = subtractIfMidnight(from);
  const outputFileName = getOutputFilename(event.title, broadcastingDate);

  return {
    stationId: event.stationId,
    title: event.title,
    artist: event.personality,
    outputFileName,
    fromTime: from,
    toTime: to,
    year: broadcastingDate.getFullYear(),
  };
}
