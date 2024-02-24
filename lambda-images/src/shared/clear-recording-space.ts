import * as fs from "node:fs";
import * as path from "node:path";
import { Env } from "./env";

export async function clearRecordingSpace(): Promise<void> {
  const dirents = fs.readdirSync(Env.writableDir, { withFileTypes: true });
  for (const dirent of dirents) {
    if (dirent.isFile() && path.extname(dirent.name) === ".mp3") {
      fs.rmSync(path.join(Env.writableDir, dirent.name));
    }
  }
}
