/**
 *  if a midnight date is given, handle it as one day ago.
 */
export function subtractIfMidnight(date: Date): Date {
  const hour = date.getHours();
  if (hour >= 0 && hour <= 3) {
    return new Date(date.getTime() - 1000 * 60 * 60 * 24);
  }
  return new Date(date.getTime());
}

export function formatTimefreeDateTime(date: Date): string {
  const yyyymmdd = formatYMD(date);
  const hhmmss = timeFormatter.format(date).replace(/:/g, "");
  return `${yyyymmdd}${hhmmss}`;
}

/**
 * @returns formatted string as `YYYYMMDD`
 */
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

export function isRecordable(
  date: Date,
): { ok: true } | { ok: false; reason: "in_the_future" | "past_a_week" } {
  const now = new Date();
  if (now.getTime() < date.getTime()) {
    return { ok: false, reason: "in_the_future" };
  }

  if (date.getTime() < now.getTime() - 7 * 24 * 60 * 60 * 1000) {
    return { ok: false, reason: "past_a_week" };
  }

  return { ok: true };
}
