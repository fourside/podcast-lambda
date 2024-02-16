import type { CronOptions } from "aws-cdk-lib/aws-events";
import { describe, expect, test } from "vitest";
import { convertCronOptions } from "./schedules";

describe(convertCronOptions.name, () => {
  test("JST9時以降で週一回", () => {
    // arrange
    const hourMin = { hour: 22, min: 30 };
    const dayOfWeek = "TUE";
    // act
    const result = convertCronOptions(hourMin, dayOfWeek);
    // assert
    expect(result).toStrictEqual<CronOptions>({
      hour: `${hourMin.hour - 9}`,
      minute: hourMin.min.toString(),
      weekDay: dayOfWeek,
    });
  });

  test("JST9時以降で帯", () => {
    // arrange
    const hourMin = { hour: 13, min: 45 };
    const dayOfWeek = ["WED" as const, "THU" as const, "SAT" as const];
    // act
    const result = convertCronOptions(hourMin, dayOfWeek);
    // assert
    expect(result).toStrictEqual<CronOptions>({
      hour: `${hourMin.hour - 9}`,
      minute: hourMin.min.toString(),
      weekDay: dayOfWeek.join(","),
    });
  });

  test("JST9時より前で週一回", () => {
    // arrange
    const hourMin = { hour: 1, min: 30 };
    const dayOfWeek = "SUN";
    // act
    const result = convertCronOptions(hourMin, dayOfWeek);
    // assert
    expect(result).toStrictEqual<CronOptions>({
      hour: `${hourMin.hour - 9 + 24}`,
      minute: hourMin.min.toString(),
      weekDay: "SAT",
    });
  });

  test("JST9時より前で帯", () => {
    // arrange
    const hourMin = { hour: 3, min: 0 };
    const dayOfWeek = ["SAT" as const, "SUN" as const, "MON" as const];
    // act
    const result = convertCronOptions(hourMin, dayOfWeek);
    // assert
    expect(result).toStrictEqual<CronOptions>({
      hour: `${hourMin.hour - 9 + 24}`,
      minute: hourMin.min.toString(),
      weekDay: ["FRI", "SAT", "SUN"].join(","),
    });
  });
});
