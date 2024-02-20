import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { Env } from "../shared/env";
import { CronEvent } from "../shared/type";
import { convertEvent } from "./convert";

describe(convertEvent.name, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("日中", () => {
    // arrange
    const now = new Date(2023, 0, 1, 15, 0, 0);
    vi.setSystemTime(now);
    const year = now.getFullYear();
    const month = twoDigit(now.getMonth() + 1);
    const day = twoDigit(now.getDate());
    const nowDate = `${year}${month}${day}`;
    const event: CronEvent = {
      title: "テスト",
      stationId: "TBS",
      personality: "パーソナリティ",
      from: { hour: 9, min: 30 },
      to: { hour: 14, min: 5 },
    };
    // act
    const result = convertEvent(event);
    // assert
    expect(result.title).toBe(event.title);
    expect(result.stationId).toBe(event.stationId);
    expect(result.artist).toBe(event.personality);
    expect(result.year).toBe(year);
    expect(result.outputFileName).toBe(
      `${Env.writableDir}/${event.title}-${nowDate}.aac`,
    );
    expect(result.fromTime).toStrictEqual(
      newDate(now, event.from.hour, event.from.min),
    );
    expect(result.toTime).toStrictEqual(
      newDate(now, event.to.hour, event.to.min),
    );
  });

  test("夜中だとファイル名は前日になり、かつ年末の場合", () => {
    // arrange
    const now = new Date(2023, 0, 1, 4, 0, 0);
    vi.setSystemTime(now);

    const lastYear = now.getFullYear() - 1;
    const lastMonth = 12;
    const lastDay = 31;
    const lastDate = `${lastYear}${lastMonth}${lastDay}`;

    const event: CronEvent = {
      title: "テスト",
      stationId: "TBS",
      personality: "パーソナリティ",
      from: { hour: 1, min: 30 },
      to: { hour: 3, min: 0 },
    };
    // act
    const result = convertEvent(event);
    // assert
    expect(result.title).toBe(event.title);
    expect(result.stationId).toBe(event.stationId);
    expect(result.artist).toBe(event.personality);
    expect(result.year).toBe(lastYear);
    expect(result.outputFileName).toBe(
      `${Env.writableDir}/${event.title}-${lastDate}.aac`,
    );
    expect(result.fromTime).toStrictEqual(
      newDate(now, event.from.hour, event.from.min),
    );
    expect(result.toTime).toStrictEqual(
      newDate(now, event.to.hour, event.to.min),
    );
  });
});

function twoDigit(number: number): string {
  return number.toString().padStart(2, "0");
}

function newDate(base: Date, hour: number, min: number): Date {
  const date = new Date(base.getTime());
  date.setHours(hour);
  date.setMinutes(min);
  date.setSeconds(0);
  return date;
}
