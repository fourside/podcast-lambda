export function getDateIfMidnightThenSubtracted(date: Date): Date {
  const hour = date.getHours();
  if (hour >= 0 && hour <= 3) {
    return new Date(date.getTime() - 1000 * 60 * 60 * 24);
  }
  return new Date(date.getTime());
}

const slackDateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDateTime(date: Date): string {
  return slackDateFormatter.format(date);
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 1000 * 60);
}

export function minusDays(date: Date, days: number): Date {
  return new Date(date.getTime() - days * 1000 * 60 * 60 * 24);
}

export function formatTimefreeDateTime(date: Date): string {
  const yyyymmdd = formatYMD(date);
  const hhmmss = timeFormatter.format(date).replace(/:/g, "");
  return `${yyyymmdd}${hhmmss}`;
}

export function formatYMD(date: Date): string {
  const year = date.getFullYear();
  const month = monthFormatter.format(date);
  const day = dayFormatter.format(date);
  return `${year}${month}${day}`;
}

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "2-digit",
});

const dayFormatter = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
});

const timeFormatter = new Intl.DateTimeFormat("ja-JP", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});
