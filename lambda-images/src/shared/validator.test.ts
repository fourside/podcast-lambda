import * as fs from "node:fs";
import * as os from "node:os";
import { describe, expect, test } from "vitest";
import { validateFileSize } from "./validator";

describe(validateFileSize.name, () => {
  test("正常", async () => {
    // arrange
    const filePath = writeTmpFile("test", (600 * 128 * 1000) / 8);
    const from = new Date(2024, 0, 1, 1, 0, 0);
    const to = new Date(2024, 0, 1, 1, 10, 0); // duration is 600 sec
    // act
    const result = await validateFileSize(filePath, from, to);
    // assert
    expect(result).toBe(true);
  });

  test("サイズが小さい", async () => {
    // arrange
    const filePath = writeTmpFile("test", (10 * 128 * 1000) / 8);
    const from = new Date(2024, 0, 1, 1, 0, 0);
    const to = new Date(2024, 0, 1, 1, 10, 0); // duration is 600 sec
    // act & assert
    await expect(() =>
      validateFileSize(filePath, from, to),
    ).rejects.toThrowError(/^recorded size is small/);
  });
});

function writeTmpFile(fileName: string, size: number): string {
  const dir = os.tmpdir();
  const filePath = `${dir}/${fileName}`;
  const buf = Buffer.alloc(size);
  fs.writeFileSync(filePath, buf);
  return filePath;
}
