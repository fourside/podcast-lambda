import { spawnSync } from "node:child_process";

export async function ffmpeg(
  args: string[],
): Promise<{ success: boolean; stdout: Uint8Array; stderr: Uint8Array }> {
  console.log(`ffmpeg args: ${args}`);

  const result = spawnSync("ffmpeg", args);
  return {
    success: result.status === 0,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

export async function getDuration(filePath: string): Promise<number> {
  const args = [
    "-i",
    filePath,
    "-show_entries",
    "format=duration",
    "-of",
    "csv=p=0",
  ];
  console.debug(`ffprobe args: ${args}`);
  const result = spawnSync("ffprobe", args);
  if (result.status !== 0) {
    const stderr = new TextDecoder().decode(result.stderr);
    console.error(result.status, stderr);
    throw new Error("ffprobe error");
  }
  const stdout = new TextDecoder().decode(result.stdout);
  console.debug("ffprobe stdout:", stdout);
  return Math.round(Number.parseFloat(stdout));
}
