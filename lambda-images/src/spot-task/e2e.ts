import { SpotTaskEvent } from "../../../event";
import { main } from "./main";

const now = new Date();

const event: SpotTaskEvent = {
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
  await main(event);
})();
