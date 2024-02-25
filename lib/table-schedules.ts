import { DayOfWeek, HourMin, schedules } from "./schedules";

type Maxes = {
  title: number;
  stationId: number;
  personality: number;
  fromTo: number;
  dayOfWeek: number;
};

function main(): void {
  const header = {
    stationId: "Station",
    title: "Title",
    personality: "Personality",
    dayOfWeek: "Day of week",
    fromTo: "Start - End",
  };
  const maxes = schedules.reduce<Maxes>(
    (acc, cur) => {
      const fromTo = `${formatHourMin(cur.fromTime)} - ${formatHourMin(
        cur.toTime,
      )}`;
      return {
        stationId: Math.max(acc.stationId, stringWidth(cur.stationId)),
        title: Math.max(acc.title, stringWidth(cur.title)),
        personality: Math.max(acc.personality, stringWidth(cur.personality)),
        dayOfWeek: Math.max(
          acc.dayOfWeek,
          stringWidth(formatDayOfWeek(cur.dayOfWeek)),
        ),
        fromTo: Math.max(acc.fromTo, stringWidth(fromTo)),
      };
    },
    {
      stationId: stringWidth(header.stationId),
      title: stringWidth(header.title),
      personality: stringWidth(header.personality),
      dayOfWeek: stringWidth(header.dayOfWeek),
      fromTo: stringWidth(header.fromTo),
    },
  );
  const maxLength = Object.values(maxes).reduce((acc, cur) => acc + cur) + 16;

  console.log(`┌${"─".repeat(maxLength - 2)}┐`);
  const formattedHeaders = [
    format(header.stationId, maxes.stationId),
    format(header.title, maxes.title),
    format(header.personality, maxes.personality),
    format(header.dayOfWeek, maxes.dayOfWeek),
    format(header.fromTo, maxes.fromTo),
  ].join("│");
  console.log(`│${formattedHeaders}│`);
  console.log(`│${"─".repeat(maxLength - 2)}│`);
  // biome-ignore lint/complexity/noForEach: <explanation>
  schedules.forEach((it) => {
    const fromTo = `${formatHourMin(it.fromTime)} - ${formatHourMin(
      it.toTime,
    )}`;
    const formatted = [
      format(it.stationId, maxes.stationId),
      format(it.title, maxes.title),
      format(it.personality, maxes.personality),
      format(formatDayOfWeek(it.dayOfWeek), maxes.dayOfWeek),
      format(fromTo, maxes.fromTo),
    ].join("│");
    console.log(`│${formatted}│`);
  });
  console.log(`└${"─".repeat(maxLength - 2)}┘`);
}

function formatHourMin(hourMin: HourMin): string {
  const hour = hourMin.hour.toString().padStart(2, "0");
  const min = hourMin.min.toString().padStart(2, "0");
  return `${hour}:${min}`;
}

function formatDayOfWeek(dayOfWeek: DayOfWeek): string {
  if (Array.isArray(dayOfWeek)) {
    return `${dayOfWeek.at(0)}-${dayOfWeek.at(-1)}`;
  }
  return dayOfWeek;
}

function stringWidth(string: string): number {
  const match = string.match(/[\s\S]/gu);
  if (match === null) {
    return 0;
  }
  return match.reduce((acc, cur) => {
    return cur.charCodeAt(0) > 127 ? acc + 2 : acc + 1;
  }, 0);
}

function format(data: string, max: number): string {
  const width = stringWidth(data);
  const spacer = " ".repeat(max - width);
  return ` ${data}${spacer} `;
}

main();
