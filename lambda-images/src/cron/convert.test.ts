import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { CronEvent } from "../../../event";
import { Env } from "../shared/env";
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
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
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
    expect(result.station).toBe(event.stationId);
    expect(result.artist).toBe(event.personality);
    expect(result.year).toBe(year);
    expect(result.outputFileName).toBe(
      `${Env.writableDir}/${event.title}-${nowDate}.mp3`,
    );
    expect(result.fromTime).toBe(`${nowDate}093000`);
    expect(result.toTime).toBe(`${nowDate}140500`);
  });

  test("夜中だとファイル名は前日になり、かつ年末", () => {
    // arrange
    const now = new Date(2023, 0, 1);
    vi.setSystemTime(now);

    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const nowDate = `${year}${month}${day}`;
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
    expect(result.station).toBe(event.stationId);
    expect(result.artist).toBe(event.personality);
    expect(result.year).toBe(2022);
    expect(result.outputFileName).toBe(
      `${Env.writableDir}/${event.title}-20221231.mp3`,
    );
    expect(result.fromTime).toBe(`${nowDate}013000`);
    expect(result.toTime).toBe(`${nowDate}030000`);
  });
});
