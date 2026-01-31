export type Program = {
  stationId: string;
  fromTime: Date;
  toTime: Date;
  title: string;
  artist: string;
  year: number;
  outputFileName: string;
};

export type HourMin = {
  hour: number;
  min: number;
};

export type CronEvent = {
  type: "cron";
  title: string;
  stationId: string;
  personality: string;
  from: HourMin;
  to: HourMin;
};

export type SpotTaskEvent = {
  type: "spot-task";
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

export type AuthResult = {
  authToken: string;
  areaId: string;
};
