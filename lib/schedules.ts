import { CronOptions } from "aws-cdk-lib/aws-events";

type HourMin = { hour: number; min: number };

const DAY_OF_WEEKS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

type SingleDayOfWeek = (typeof DAY_OF_WEEKS)[number];
type DayOfWeek = SingleDayOfWeek | SingleDayOfWeek[];

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
];

export function convertCronOptions(
  hourMin: HourMin,
  dayOfWeek: DayOfWeek,
): CronOptions {
  const utcHour = hourMin.hour - 9;
  if (utcHour < 0) {
    return {
      minute: hourMin.min.toString(),
      hour: (utcHour + 24).toString(),
      weekDay: Array.isArray(dayOfWeek)
        ? dayOfWeek.map(minusDayOfWeek).join(",")
        : minusDayOfWeek(dayOfWeek),
    };
  }
  return {
    minute: hourMin.min.toString(),
    hour: utcHour.toString(),
    weekDay: Array.isArray(dayOfWeek) ? dayOfWeek.join(",") : dayOfWeek,
  };
}

function minusDayOfWeek(dayOfWeek: SingleDayOfWeek): SingleDayOfWeek {
  const i = DAY_OF_WEEKS.findIndex((it) => it === dayOfWeek);
  return i === 0 ? DAY_OF_WEEKS[6] : DAY_OF_WEEKS[i - 1];
}
