import * as fs from "node:fs";
import { formatTimefreeDateTime } from "./date";
import { Env } from "./env";
import { ffmpeg } from "./ffmpeg";
import { RecRadikoError } from "./rec-radiko-error";
import type { Program } from "./type";

export async function record(
  program: Program,
  authToken: string,
): Promise<void> {
  const m3u8Url = await fetchM3U8Url(authToken, {
    stationId: program.stationId,
    fromTime: formatTimefreeDateTime(program.fromTime),
    toTime: formatTimefreeDateTime(program.toTime),
  });

  const urls = await fetchAACUrls(m3u8Url, authToken);
  console.debug("aac url size: ", urls.length);
  const tmpFilePath = `${Env.writableDir}/tmp`;
  if (fs.existsSync(tmpFilePath)) {
    // timeout causes retry
    fs.rmSync(tmpFilePath);
  }
  const fd = fs.openSync(tmpFilePath, "ax");
  for (const url of urls) {
    await fetchAndWrite(url, fd);
  }
  fs.closeSync(fd);

  const args = [
    "-i",
    tmpFilePath,
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
  if (!res.ok) {
    throw new Error(`playlist response is not ok. status: ${res.status}`);
  }
  const body = await res.text();
  console.debug("get m3u8 url in... :", body);

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
  if (!res.ok) {
    throw new Error(
      `m3u8 response is not ok. status: ${res.status}, url: ${m3u8Url}`,
    );
  }

  const match = body.match(/^https.+$/gm);
  if (match === null) {
    console.debug("get m3u8 content:", body);
    throw new Error("not contain any media url");
  }
  return match;
}

async function fetchAndWrite(url: string, fd: number): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`response is not ok. status: ${res.status}, url: ${url}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);
  fs.writeSync(fd, buffer);
}
