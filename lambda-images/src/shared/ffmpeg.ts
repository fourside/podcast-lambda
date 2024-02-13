import { spawnSync } from "node:child_process";

export async function run(
  args: string[],
): Promise<{ success: boolean; stdout: Uint8Array; stderr: Uint8Array }> {
  console.debug(`ffmpeg args: ${args}`);
  const result = spawnSync("ffmpeg", args);
  return {
    success: result.status === 0,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}
