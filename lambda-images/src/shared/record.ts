import { ffmpeg } from "./ffmpeg";
import { RecRadikoError } from "./rec-radiko-error";

export type ProgramTimefree = {
  stationId: string;
  fromTime: string;
  toTime: string;
  title: string;
  artist: string;
  year: number;
  outputFileName: string;
};

export async function record(
  program: ProgramTimefree,
  authToken: string,
): Promise<void> {
  const args = [
    "-loglevel",
    "error",
    "-fflags",
    "+discardcorrupt",
    "-headers",
    `X-Radiko-Authtoken: ${authToken}`,
    "-i",
    `https://radiko.jp/v2/api/ts/playlist.m3u8?station_id=${program.stationId}&l=15&ft=${program.fromTime}&to=${program.toTime}`,
    "-b:a",
    "128k",
    "-y",
    "-metadata",
    `title=${program.title}`,
    "-metadata",
    `artist=${program.artist}`,
    "-metadata",
    `year=${program.year}`,
    program.outputFileName,
  ];
  const { success, stdout, stderr } = await ffmpeg(args);
  if (success) {
    if (stdout.length !== 0) {
      console.log(new TextDecoder().decode(stdout));
    }
  } else {
    const error = new TextDecoder().decode(stderr);
    throw new RecRadikoError(error);
  }
}
