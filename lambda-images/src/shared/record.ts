import * as fs from "node:fs";
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

/**
 * use if ffmpeg's download is unstable
 */
async function _record(
  program: ProgramTimefree,
  authToken: string,
): Promise<void> {
  const m3u8Url = await fetchM3U8Url(authToken, {
    stationId: program.stationId,
    fromTime: program.fromTime,
    toTime: program.toTime,
  });

  const urls = await fetchAACUrls(m3u8Url, authToken);
  const fd = fs.openSync(program.outputFileName, "a");
  for (const url of urls) {
    await fetchAndWrite(url, fd);
  }
  fs.closeSync(fd);

  const args = [
    "-i",
    program.outputFileName,
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

type M3U8Params = {
  stationId: string;
  fromTime: string;
  toTime: string;
};

async function fetchM3U8Url(
  authToken: string,
  params: M3U8Params,
): Promise<string> {
  const res = await fetch(
    `https://radiko.jp/v2/api/ts/playlist.m3u8?station_id=${params.stationId}&l=15&ft=${params.fromTime}&to=${params.toTime}`,
    {
      method: "POST",
      headers: {
        "X-Radiko-Authtoken": authToken,
      },
    },
  );
  const body = await res.text();
  console.debug("get m3u8 url:", body);

  const match = body.match(/^https.+$/m);
  if (match === null) {
    throw new Error("not contain m3u8 url");
  }
  return match[0];
}

async function fetchAACUrls(
  m3u8Url: string,
  authToken: string,
): Promise<string[]> {
  const res = await fetch(m3u8Url, {
    headers: {
      "X-Radiko-Authtoken": authToken,
    },
  });
  const body = await res.text();
  console.debug("get m3u8 content", body);

  const match = body.match(/^https.+$/gm);
  if (match === null) {
    throw new Error("not contain m3u8 url");
  }
  return match;
}

async function fetchAndWrite(url: string, fd: number): Promise<void> {
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);
  fs.writeSync(fd, buffer);
}
