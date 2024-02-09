type Schedule = {
  name: string;
  cronDate: CronDate;
  station: string;
  duration: number;
  title: string;
  personality: string;
};

export const schedules: Schedule[] = [
  {
    name: "bakadikara",
    cronDate: { min: 0, hour: 1, dayOfWeek: "TUE" },
    station: "TBS",
    duration: 120,
    title: "伊集院光深夜の馬鹿力",
    personality: "伊集院光",
  },
  {
    name: "cowboy",
    cronDate: { min: 0, hour: 1, dayOfWeek: "WED" },
    station: "TBS",
    duration: 120,
    title: "爆笑問題カーボーイ",
    personality: "爆笑問題",
  },
  {
    name: "bananamoon",
    cronDate: { min: 0, hour: 1, dayOfWeek: "SAT" },
    station: "TBS",
    duration: 120,
    title: "バナナムーン",
    personality: "バナナマン",
  },
  {
    name: "elekata_ketsubi",
    cronDate: { min: 0, hour: 1, dayOfWeek: "SUN" },
    station: "TBS",
    duration: 60,
    title: "エレ片のケツビ",
    personality: "エレキコミック・片桐仁",
  },
  {
    name: "america_nagaremono",
    cronDate: { min: 0, hour: 15, dayOfWeek: "TUE" },
    station: "TBS",
    duration: 30,
    title: "町山智浩アメリカ流れ者",
    personality: "町山智浩",
  },
  {
    name: "after6junction2",
    cronDate: { min: 0, hour: 22, dayOfWeek: ["MON", "TUE", "WED", "THU"] },
    station: "TBS",
    duration: 90,
    title: "アフター6ジャンクション2",
    personality: "ライムスター宇多丸",
  },
  {
    name: "sayonara_cityboys",
    cronDate: { min: 0, hour: 19, dayOfWeek: "SAT" },
    station: "QRR",
    duration: 30,
    title: "SAYONARAシティボーイズ",
    personality: "シティボーイズ",
  },
  {
    name: "100years_radio",
    cronDate: { min: 0, hour: 11, dayOfWeek: "SUN" },
    station: "JOAK-FM",
    duration: 50,
    title: "伊集院光の百年ラヂオ",
    personality: "伊集院光",
  },
  {
    name: "ijuuin_no_tane",
    cronDate: { min: 30, hour: 17, dayOfWeek: ["TUE", "WED", "THU", "FRI"] },
    station: "LFR",
    duration: 50,
    title: "伊集院光のタネ",
    personality: "伊集院光",
  },
];

const DAY_OF_WEEKS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

type CronDate = { min: number; hour: number; dayOfWeek: DayOfWeek };
type SingleDayOfWeek = (typeof DAY_OF_WEEKS)[number];
type MultiDayOfWeek = SingleDayOfWeek[];
type DayOfWeek = SingleDayOfWeek | MultiDayOfWeek;

export function jstToUtc(jst: CronDate): CronDate {
  const utcHour = jst.hour - 9;
  if (utcHour < 0) {
    return {
      min: jst.min,
      hour: utcHour + 24,
      dayOfWeek: Array.isArray(jst.dayOfWeek)
        ? jst.dayOfWeek.map(minusDayOfWeek)
        : minusDayOfWeek(jst.dayOfWeek),
    };
  }
  return {
    min: jst.min,
    hour: utcHour,
    dayOfWeek: jst.dayOfWeek,
  };
}

export function toTime(cron: CronDate, duration: number): CronDate {
  const min = cron.min + duration;
  if (min < 60) {
    return {
      ...cron,
      min,
    };
  }
  const hour = cron.hour + min / 60;
  if (hour < 24) {
    return {
      ...cron,
      min: min % 60,
      hour,
    };
  }
  return {
    min: min % 60,
    hour: hour - 24,
    dayOfWeek: Array.isArray(cron.dayOfWeek)
      ? cron.dayOfWeek.map(plusDayOfWeek)
      : plusDayOfWeek(cron.dayOfWeek),
  };
}

function minusDayOfWeek(dayOfWeek: SingleDayOfWeek): SingleDayOfWeek {
  const i = DAY_OF_WEEKS.findIndex((it) => it === dayOfWeek);
  return i === 0 ? DAY_OF_WEEKS[6] : DAY_OF_WEEKS[i - 1];
}

function plusDayOfWeek(dayOfWeek: SingleDayOfWeek): SingleDayOfWeek {
  const i = DAY_OF_WEEKS.findIndex((it) => it === dayOfWeek);
  return i === DAY_OF_WEEKS.length - 1 ? DAY_OF_WEEKS[0] : DAY_OF_WEEKS[i + 1];
}
