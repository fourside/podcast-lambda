import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  formatTimefreeDateTime,
  isRecordable,
  subtractIfMidnight,
} from "./date";

describe(subtractIfMidnight.name, () => {
  test("夜中でなければ同じDate", () => {
    // arrange
    const date = new Date(2022, 1, 20, 15, 30, 15);
    // act
    const result = subtractIfMidnight(date);
    // assert
    expect(result).toStrictEqual(date);
  });

  test("夜中であれば前日", () => {
    // arrange
    const date = new Date(2022, 1, 20, 0, 30, 15);
    // act
    const result = subtractIfMidnight(date);
    // assert
    expect(result.getFullYear()).toBe(date.getFullYear());
    expect(result.getMonth()).toBe(date.getMonth());
    expect(result.getDate()).toBe(date.getDate() - 1);
    expect(result.getHours()).toBe(date.getHours());
    expect(result.getMinutes()).toBe(date.getMinutes());
  });

  test("夜中で月初なら前月になる", () => {
    // arrange
    const date = new Date(2022, 2, 1, 1, 30, 15);
    // act
    const result = subtractIfMidnight(date);
    // assert
    const lastDate = new Date(date.getFullYear(), date.getMonth(), 0).getDate(); // 前月の月初
    expect(result.getFullYear()).toBe(date.getFullYear());
    expect(result.getMonth()).toBe(date.getMonth() - 1);
    expect(result.getDate()).toBe(lastDate);
    expect(result.getHours()).toBe(date.getHours());
    expect(result.getMinutes()).toBe(date.getMinutes());
  });

  test("夜中で年初なら前年になる", () => {
    // arrange
    const date = new Date(2022, 0, 1, 1, 30, 15);
    // act
    const result = subtractIfMidnight(date);
    // assert
    expect(result.getFullYear()).toBe(date.getFullYear() - 1);
    expect(result.getMonth()).toBe(11);
    expect(result.getDate()).toBe(31);
    expect(result.getHours()).toBe(date.getHours());
    expect(result.getMinutes()).toBe(date.getMinutes());
  });
});

describe(formatTimefreeDateTime.name, () => {
  test("通常", () => {
    // arrange
    const date = new Date(2020, 0, 2, 3, 4, 5);
    // act
    const result = formatTimefreeDateTime(date);
    // assert
    expect(result).toBe("20200102030405");
  });
});

describe(isRecordable.name, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("ok", () => {
    // arrange
    const sysDate = new Date(2024, 4, 1, 12, 30, 45);
    vi.setSystemTime(sysDate);
    const date = new Date(2024, 4, 1, 11, 0, 0);
    // act
    const result = isRecordable(date);
    // assert
    expect(result).toStrictEqual<ReturnType<typeof isRecordable>>({ ok: true });
  });

  test("未来", () => {
    // arrange
    const sysDate = new Date(2024, 4, 1, 12, 30, 45);
    vi.setSystemTime(sysDate);
    const date = new Date(2024, 4, 1, 12, 40, 0);
    // act
    const result = isRecordable(date);
    // assert
    expect(result).toStrictEqual<ReturnType<typeof isRecordable>>({
      ok: false,
      reason: "in_the_future",
    });
  });

  test("過去7日以上経過", () => {
    // arrange
    const sysDate = new Date(2024, 4, 8, 12, 30, 45);
    vi.setSystemTime(sysDate);
    const date = new Date(2024, 4, 1, 12, 20, 0);
    // act
    const result = isRecordable(date);
    // assert
    expect(result).toStrictEqual<ReturnType<typeof isRecordable>>({
      ok: false,
      reason: "past_a_week",
    });
  });
});
