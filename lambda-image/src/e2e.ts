import { main } from "./main";
import type { CronEvent, SpotTaskEvent } from "./type";

const cronEvent: CronEvent = {
  title: "サンプル",
  stationId: "TBS",
  personality: "パーソナリティ",
  from: { hour: 22, min: 30 },
  to: { hour: 22, min: 32 },
};

const now = new Date();

const spotTaskEvent: SpotTaskEvent = {
  title: "サンプル",
  stationId: "TBS",
  personality: "パーソナリティ",
  from: {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    hour: 22,
    min: 30,
  },
  to: {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    hour: 22,
    min: 32,
  },
};

(async () => {
  await main(spotTaskEvent);
})();
