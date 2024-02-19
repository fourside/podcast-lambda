import * as fs from "node:fs";
import { RecRadikoError } from "./rec-radiko-error";

const BPS = 128 * 1000;

/**
 * @throws {RecRadikoError} error
 */
export async function validateFileSize(
  filePath: string,
  from: Date,
  to: Date,
): Promise<true> {
  const stats = fs.statSync(filePath);
  const duration = Math.floor((to.getTime() - from.getTime()) / 1000);
  const expectedBytes = (duration * BPS) / 8;
  console.debug(`recorded bytes: ${stats.size}`);
  console.debug(`expected bytes: ${expectedBytes}`);
  if (stats.size < Math.floor(expectedBytes * 0.9)) {
    throw new RecRadikoError(
      `recorded size is small: actual ${stats.size} bytes against expected ${expectedBytes} bytes`,
    );
  }
  return true;
}
