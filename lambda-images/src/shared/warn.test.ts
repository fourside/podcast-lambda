import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { warnIfDurationIsShort } from "./warn";

describe(warnIfDurationIsShort.name, () => {
  afterAll(() => {
    vi.restoreAllMocks();
  });

  beforeAll(() => {
    vi.mock("./ffmpeg", () => {
      const getDuration = vi
        .fn()
        .mockImplementation((filePath: string) =>
          filePath === "normal" ? 600 : filePath === "small" ? 100 : 400,
        );
      return {
        getDuration,
      };
    });
  });

  test("正常", async () => {
    // arrange
    const filePath = "normal";
    const from = new Date(2024, 0, 1, 1, 0, 0);
    const to = new Date(2024, 0, 1, 1, 10, 0); // duration is 600 sec
    // act
    const result = await warnIfDurationIsShort(filePath, from, to);
    // assert
    expect(result).toBe(true);
  });

  test("時間が小さい", async () => {
    // arrange
    const filePath = "small";
    const from = new Date(2024, 0, 1, 1, 0, 0);
    const to = new Date(2024, 0, 1, 1, 10, 0); // duration is 600 sec
    // act & assert
    await expect(() =>
      warnIfDurationIsShort(filePath, from, to),
    ).rejects.toThrowError(/^recorded duration is small/);
  });
});
