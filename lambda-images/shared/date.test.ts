import { describe, expect, test } from "vitest";
import {
  addMinutes,
  formatTimefreeDateTime,
  getDateIfMidnightThenSubtracted,
  minusDays,
} from "./date";

describe(getDateIfMidnightThenSubtracted.name, () => {
  test("夜中でなければ同じDate", () => {
    // arrange
    const date = new Date(2022, 1, 20, 15, 30, 15);
    // act
    const result = getDateIfMidnightThenSubtracted(date);
    // assert
    expect(result).toStrictEqual(date);
  });

  test("夜中であれば前日", () => {
    // arrange
    const date = new Date(2022, 1, 20, 0, 30, 15);
    // act
    const result = getDateIfMidnightThenSubtracted(date);
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
    const result = getDateIfMidnightThenSubtracted(date);
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
    const result = getDateIfMidnightThenSubtracted(date);
    // assert
    expect(result.getFullYear()).toBe(date.getFullYear() - 1);
    expect(result.getMonth()).toBe(11);
    expect(result.getDate()).toBe(31);
    expect(result.getHours()).toBe(date.getHours());
    expect(result.getMinutes()).toBe(date.getMinutes());
  });
});

describe(addMinutes.name, () => {
  test("通常", () => {
    // arrange
    const date = new Date(2020, 0, 10, 20, 30, 0);
    const durationMin = 30;
    // act
    const result = addMinutes(date, durationMin);
    // assert
    expect(result).toStrictEqual(new Date(2020, 0, 10, 21, 0, 0));
  });

  test("over date", () => {
    // arrange
    const date = new Date(2020, 0, 10, 23, 30, 0);
    const durationMin = 150;
    // act
    const result = addMinutes(date, durationMin);
    // assert
    expect(result).toStrictEqual(new Date(2020, 0, 11, 2, 0, 0));
  });
});

describe(minusDays.name, () => {
  test("通常", () => {
    // arrange
    const date = new Date(2020, 3, 1, 23, 30, 5);
    const days = 2;
    // act
    const result = minusDays(date, days);
    // assert
    expect(result).toStrictEqual(new Date(2020, 2, 30, 23, 30, 5));
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
