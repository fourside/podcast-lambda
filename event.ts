export type CronEvent = {
  title: string;
  stationId: string;
  personality: string;
  from: { hour: number; min: number };
  to: { hour: number; min: number };
};

export type SpotTaskEvent = {
  title: string;
  stationId: string;
  personality: string;
  from: EventDateTime;
  to: EventDateTime;
};

export type EventDateTime = {
  year: number;
  month: number;
  day: number;
  hour: number;
  min: number;
};
