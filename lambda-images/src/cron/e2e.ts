import { CronEvent } from "../shared/type";
import { main } from "./main";

const event: CronEvent = {
  title: "サンプル",
  stationId: "TBS",
  personality: "パーソナリティ",
  from: { hour: 22, min: 30 },
  to: { hour: 22, min: 32 },
};

(async () => {
  await main(event);
})();
