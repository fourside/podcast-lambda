import { formatYMD } from "./date";
import { Env } from "./env";

export function getOutputFilename(title: string, date: Date): string {
  const suffix = formatYMD(date);
  return `${Env.writableDir}/${title}-${suffix}.mp3`;
}
