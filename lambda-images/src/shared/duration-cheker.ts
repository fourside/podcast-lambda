import { getDuration } from "./ffmpeg";
import { RecRadikoError } from "./rec-radiko-error";

export async function checkIfDurationIsShort(
  filePath: string,
  from: Date,
  to: Date,
): Promise<true> {
  const actualDuration = await getDuration(filePath);
  const expectedDuration = Math.floor((to.getTime() - from.getTime()) / 1000);
  console.debug("duration(sec) info", {
    recorded: actualDuration,
    expected: expectedDuration,
  });
  if (actualDuration < expectedDuration) {
    throw new RecRadikoError(
      `recorded duration is small: actual ${actualDuration} sec but expected ${expectedDuration} sec.`,
    );
  }
  return true;
}
