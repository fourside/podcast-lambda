export type CronEvent = {
  title: string;
  stationId: string;
  personality: string;
  from: { hour: number; min: number };
  to: { hour: number; min: number };
};
