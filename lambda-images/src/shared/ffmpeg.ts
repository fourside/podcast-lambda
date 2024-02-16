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
