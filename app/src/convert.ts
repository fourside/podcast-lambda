import type { PodcastEvent } from "../../event.ts";
import {
  formatTimefreeDateTime,
  getDateIfMidnightThenSubtracted,
} from "./date.ts";
import { getOutputFilename } from "./output-filename.ts";
import { ProgramTimefree } from "./record.ts";

export function convertEvent(event: PodcastEvent): ProgramTimefree {
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
