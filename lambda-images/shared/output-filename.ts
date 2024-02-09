import { formatYMD } from "./date";

export function getOutputFilename(title: string, date: Date): string {
  const suffix = formatYMD(date);
  return `${title}-${suffix}.mp3`;
}
