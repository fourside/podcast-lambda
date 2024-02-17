import type { EventDateTime, SpotTaskEvent } from "../../../event";
import { formatTimefreeDateTime, subtractIfMidnight } from "../shared/date";
import { getOutputFilename } from "../shared/output-filename";
import type { ProgramTimefree } from "../shared/record";

export function convertEvent(event: SpotTaskEvent): ProgramTimefree {
  const from = eventDateTimeToDate(event.from);
  const to = eventDateTimeToDate(event.to);
  const broadcastingDate = subtractIfMidnight(from);
  const outputFileName = getOutputFilename(event.title, broadcastingDate);

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

function eventDateTimeToDate(datetime: EventDateTime): Date {
  const date = new Date(
    datetime.year,
    datetime.month - 1,
    datetime.day,
    datetime.hour,
    datetime.min,
    0,
  );
  if (date.getFullYear() !== datetime.year) {
    throw new Error(
      `year is invalid: ${datetime.year} became ${date.getFullYear()}`,
    );
  }
  if (date.getMonth() !== datetime.month - 1) {
    throw new Error(
      `month is invalid: ${datetime.month - 1} became ${date.getMonth()}`,
    );
  }
  if (date.getDate() !== datetime.day) {
    throw new Error(`day is invalid: ${datetime.day} became ${date.getDate()}`);
  }
  if (date.getHours() !== datetime.hour) {
    throw new Error(
      `hour is invalid: ${datetime.hour} became ${date.getHours()}`,
    );
  }
  if (date.getMinutes() !== datetime.min) {
    throw new Error(
      `min is invalid: ${datetime.min} became ${date.getMinutes()}`,
    );
  }

  return date;
}
