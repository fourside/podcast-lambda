import { isRecordable, subtractIfMidnight } from "./date";
import { getOutputFilename } from "./output-filename";
import type { CronEvent, EventDateTime, Program, SpotTaskEvent } from "./type";

export function convertCronEvent(event: CronEvent): Program {
  if (event.from.hour > event.to.hour) {
    throw new Error("converter not support over date program");
  }

  const from = new Date();
  const now = from.getTime();
  from.setHours(event.from.hour);
  from.setMinutes(event.from.min);
  from.setSeconds(0);
  if (from.getTime() > now) {
    from.setTime(from.getTime() - 24 * 60 * 60 * 1000);
  }
  const fromRecordable = isRecordable(from);
  if (!fromRecordable.ok) {
    throw new Error(`from is invalid: ${fromRecordable.reason}`);
  }

  const to = new Date(from.getTime());
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

export function convertSpotTaskEvent(event: SpotTaskEvent): Program {
  const from = eventDateTimeToDate(event.from);
  const fromRecordable = isRecordable(from);
  if (!fromRecordable.ok) {
    throw new Error(`from is invalid: ${fromRecordable.reason}`);
  }
  const to = eventDateTimeToDate(event.to);
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
