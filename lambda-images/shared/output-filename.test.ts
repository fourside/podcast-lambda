import { describe, expect, test } from "vitest";
import { getOutputFilename } from "./output-filename";

describe(getOutputFilename.name, () => {
  test("ファイル名のフォーマット", () => {
    // arrange
    const title = "title";
    const date = new Date(2022, 0, 1, 15, 30, 15);
    // act
    const result = getOutputFilename(title, date);
    // assert
    expect(result).toBe("title-20220101.mp3");
  });
});
