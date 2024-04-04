import type { CronOptions } from "aws-cdk-lib/aws-events";

export type HourMin = { hour: number; min: number };

const DAY_OF_WEEKS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

type SingleDayOfWeek = (typeof DAY_OF_WEEKS)[number];
export type DayOfWeek = SingleDayOfWeek | SingleDayOfWeek[];

type Schedule = {
  name: string;
  title: string;
  stationId: string;
  personality: string;
  fromTime: HourMin; // JST
  toTime: HourMin; // JST
  dayOfWeek: DayOfWeek; // of toTime
};

export const schedules: Schedule[] = [
  {
    name: "bakadikara",
    title: "伊集院光深夜の馬鹿力",
    stationId: "TBS",
    personality: "伊集院光",
    fromTime: { hour: 1, min: 0 },
    toTime: { hour: 3, min: 0 },
    dayOfWeek: "TUE",
  },
  {
    name: "cowboy",
    title: "爆笑問題カーボーイ",
    stationId: "TBS",
    personality: "爆笑問題",
    fromTime: { hour: 1, min: 0 },
    toTime: { hour: 3, min: 0 },
    dayOfWeek: "WED",
  },
  {
    name: "bananamoon",
    title: "バナナムーン",
    stationId: "TBS",
    personality: "バナナマン",
    fromTime: { hour: 1, min: 0 },
    toTime: { hour: 3, min: 0 },
    dayOfWeek: "SAT",
  },
  {
    name: "elekata_ketsubi",
    title: "エレ片のケツビ",
    stationId: "TBS",
    personality: "エレキコミック・片桐仁",
    fromTime: { hour: 1, min: 0 },
    toTime: { hour: 2, min: 0 },
    dayOfWeek: "SUN",
  },
  {
    name: "america_nagaremono",
    title: "町山智浩アメリカ流れ者",
    stationId: "TBS",
    personality: "町山智浩",
    fromTime: { hour: 15, min: 0 },
    toTime: { hour: 15, min: 30 },
    dayOfWeek: "TUE",
  },
  {
    name: "after6junction2",
    title: "アフター6ジャンクション2",
    stationId: "TBS",
    personality: "ライムスター宇多丸",
    fromTime: { hour: 22, min: 0 },
    toTime: { hour: 23, min: 55 },
    dayOfWeek: ["MON", "TUE", "WED", "THU"],
  },
  {
    name: "sayonara_cityboys",
    title: "SAYONARAシティボーイズ",
    stationId: "QRR",
    personality: "シティボーイズ",
    fromTime: { hour: 19, min: 0 },
    toTime: { hour: 19, min: 30 },
    dayOfWeek: "SAT",
  },
  {
    name: "100years_radio",
    title: "伊集院光の百年ラヂオ",
    stationId: "JOAK-FM",
    personality: "伊集院光",
    fromTime: { hour: 11, min: 0 },
    toTime: { hour: 11, min: 50 },
    dayOfWeek: "SUN",
  },
  {
    name: "ijuuin_no_tane",
    title: "伊集院光のタネ",
    stationId: "LFR",
    personality: "伊集院光",
    fromTime: { hour: 17, min: 30 },
    toTime: { hour: 18, min: 0 },
    dayOfWeek: ["TUE", "WED", "THU", "FRI"],
  },
  {
    name: "ijuuin_no_choi_tane",
    title: "伊集院光のちょいタネ",
    stationId: "LFR",
    personality: "伊集院光",
    fromTime: { hour: 11, min: 20 },
    toTime: { hour: 11, min: 30 },
    dayOfWeek: ["MON", "TUE", "WED", "THU", "FRI"],
  },
];

const DELAY_MIN = 5;

export function convertCronOptions(
  hourMin: HourMin,
  dayOfWeek: DayOfWeek,
): CronOptions {
  const [addedHourmin, addedDayOfWeek] = addMin(hourMin, dayOfWeek, DELAY_MIN);

  const utcHour = addedHourmin.hour - 9;
  if (utcHour < 0) {
    return {
      minute: addedHourmin.min.toString(),
      hour: (utcHour + 24).toString(),
      weekDay: Array.isArray(addedDayOfWeek)
        ? addedDayOfWeek.map(minusDayOfWeek).join(",")
        : minusDayOfWeek(addedDayOfWeek),
    };
  }
  return {
    minute: addedHourmin.min.toString(),
    hour: utcHour.toString(),
    weekDay: Array.isArray(addedDayOfWeek)
      ? addedDayOfWeek.join(",")
      : addedDayOfWeek,
  };
}

function addMin(
  hourMin: HourMin,
  dayOfWeek: DayOfWeek,
  add: number,
): [HourMin, DayOfWeek] {
  const addedMin = hourMin.min + add;
  if (addedMin >= 60) {
    return addHour(
      {
        hour: hourMin.hour,
        min: addedMin - 60,
      },
      dayOfWeek,
      1,
    );
  }
  return [
    {
      hour: hourMin.hour,
      min: addedMin,
    },
    dayOfWeek,
  ];
}

function addHour(
  hourMin: HourMin,
  dayOfWeek: DayOfWeek,
  add: number,
): [HourMin, DayOfWeek] {
  const addedHour = hourMin.hour + add;
  if (addedHour >= 24) {
    const nextDayOfWeek = Array.isArray(dayOfWeek)
      ? dayOfWeek.map(plusDayOfWeek)
      : plusDayOfWeek(dayOfWeek);
    return [
      {
        hour: addedHour - 24,
        min: hourMin.min,
      },
      nextDayOfWeek,
    ];
  }
  return [
    {
      hour: addedHour,
      min: hourMin.min,
    },
    dayOfWeek,
  ];
}

function minusDayOfWeek(dayOfWeek: SingleDayOfWeek): SingleDayOfWeek {
  const i = DAY_OF_WEEKS.findIndex((it) => it === dayOfWeek);
  return i === 0 ? DAY_OF_WEEKS[6] : DAY_OF_WEEKS[i - 1];
}

function plusDayOfWeek(dayOfWeek: SingleDayOfWeek): SingleDayOfWeek {
  const i = DAY_OF_WEEKS.findIndex((it) => it === dayOfWeek);
  return i === 6 ? DAY_OF_WEEKS[0] : DAY_OF_WEEKS[i + 1];
}
