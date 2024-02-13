import type { CronEvent } from "../../../event";
import {
  formatTimefreeDateTime,
  getDateIfMidnightThenSubtracted,
} from "../shared/date";
import { getOutputFilename } from "../shared/output-filename";
import type { ProgramTimefree } from "../shared/record";

export function convertEvent(event: CronEvent): ProgramTimefree {
  const from = new Date();
  from.setHours(event.from.hour);
  from.setMinutes(event.from.min);
  const recordDate = getDateIfMidnightThenSubtracted(from);
  const outputFileName = getOutputFilename(event.title, recordDate);

  const to = new Date(); // FIXME: 日跨ぎは考慮していない
  to.setHours(event.to.hour);
  to.setMinutes(event.to.min);

  return {
    station: event.stationId,
    title: event.title,
    artist: event.personality,
    outputFileName,
    fromTime: formatTimefreeDateTime(from),
    toTime: formatTimefreeDateTime(to),
    year: recordDate.getFullYear(),
  };
}
