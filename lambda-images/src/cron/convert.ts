import type { CronEvent } from "../../../event";
import { formatTimefreeDateTime, subtractIfMidnight } from "../shared/date";
import { getOutputFilename } from "../shared/output-filename";
import type { ProgramTimefree } from "../shared/record";

export function convertEvent(event: CronEvent): ProgramTimefree {
  if (event.from.hour > event.to.hour) {
    throw new Error("converter not support over date program");
  }

  const from = new Date();
  from.setHours(event.from.hour);
  from.setMinutes(event.from.min);
  from.setSeconds(0);
  const broadcastingDate = subtractIfMidnight(from);
  const outputFileName = getOutputFilename(event.title, broadcastingDate);

  const to = new Date();
  to.setHours(event.to.hour);
  to.setMinutes(event.to.min);
  to.setSeconds(0);

  return {
    station: event.stationId,
    title: event.title,
    artist: event.personality,
    outputFileName,
    fromTime: formatTimefreeDateTime(from),
    toTime: formatTimefreeDateTime(to),
    year: broadcastingDate.getFullYear(),
  };
}
