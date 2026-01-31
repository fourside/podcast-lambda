import * as crypto from "node:crypto";
import * as fs from "node:fs";
import { formatTimefreeDateTime } from "./date";
import { Env } from "./env";
import { ffmpeg, getDuration } from "./ffmpeg";
import { RecRadikoError } from "./rec-radiko-error";
import type { AuthResult, Program } from "./type";

const CHUNK_DURATION_SEC = 300;

export async function record(
  program: Program,
  auth: AuthResult,
): Promise<void> {
  const hlsUrls = await fetchHlsUrls(program.stationId);
  console.log(`Found ${hlsUrls.length} HLS URLs`);

  const lsid = crypto.randomBytes(16).toString("hex");
  let lastError: Error | null = null;

  for (let i = 0; i < hlsUrls.length; i++) {
    const hlsUrl = hlsUrls[i];
    console.log(`Trying HLS URL ${i + 1}/${hlsUrls.length}: ${hlsUrl}`);

    try {
      const chunkFiles = await downloadChunks({
        hlsUrl,
        stationId: program.stationId,
        fromTime: program.fromTime,
        toTime: program.toTime,
        auth,
        lsid,
      });

      await concatChunks(chunkFiles, program);

      // cleanup chunk files
      for (const file of chunkFiles) {
        if (fs.existsSync(file)) {
          fs.rmSync(file);
        }
      }

      // 成功したら終了
      return;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`HLS URL ${i + 1} failed: ${lastError.message}`);
      // 次のURLを試す
    }
  }

  // すべてのURLが失敗
  throw lastError ?? new RecRadikoError("All HLS URLs failed");
}

async function fetchHlsUrls(stationId: string): Promise<string[]> {
  const res = await fetch(
    `https://radiko.jp/v3/station/stream/pc_html5/${stationId}.xml`,
  );
  if (!res.ok) {
    throw new RecRadikoError(
      `station stream xml response is not ok. status: ${res.status}`,
    );
  }
  const body = await res.text();
  console.debug("station stream xml:", body);

  // Extract all playlist_create_url for timefree='1' and areafree='0'
  const regex =
    /<url\s+(?=[^>]*areafree="0")(?=[^>]*timefree="1")[^>]*>[\s\S]*?<playlist_create_url>([^<]+)<\/playlist_create_url>/g;
  const urls = [...body.matchAll(regex)].map((m) => m[1].trim());

  if (urls.length === 0) {
    throw new RecRadikoError("not contain playlist_create_url");
  }
  return urls;
}

type DownloadParams = {
  hlsUrl: string;
  stationId: string;
  fromTime: Date;
  toTime: Date;
  auth: AuthResult;
  lsid: string;
};

async function downloadChunks(params: DownloadParams): Promise<string[]> {
  const { hlsUrl, stationId, fromTime, toTime, auth, lsid } = params;

  const fromUnix = Math.floor(fromTime.getTime() / 1000);
  const toUnix = Math.floor(toTime.getTime() / 1000);
  const expectedTotal = toUnix - fromUnix;
  let seekTimestamp = fromUnix;
  let leftSec = expectedTotal;
  let chunkNo = 0;
  let totalRequestedSec = 0;
  let totalActualSec = 0;
  const chunkFiles: string[] = [];

  while (leftSec > 0) {
    const chunkFile = `${Env.writableDir}/chunk${chunkNo}.m4a`;

    // chunk max 300 seconds, round up to nearest 5 seconds
    let chunkLen = CHUNK_DURATION_SEC;
    if (leftSec < CHUNK_DURATION_SEC) {
      chunkLen =
        leftSec % 5 === 0 ? leftSec : (Math.floor(leftSec / 5) + 1) * 5;
    }

    const seek = formatTimefreeDateTime(new Date(seekTimestamp * 1000));
    const endAt = formatTimefreeDateTime(
      new Date((seekTimestamp + chunkLen) * 1000),
    );
    const fromTimeStr = formatTimefreeDateTime(fromTime);

    const streamUrl = `${hlsUrl}?station_id=${stationId}&start_at=${fromTimeStr}&ft=${fromTimeStr}&seek=${seek}&end_at=${endAt}&to=${endAt}&l=${chunkLen}&lsid=${lsid}&type=c`;

    const args = [
      "-nostdin",
      "-loglevel",
      "error",
      "-fflags",
      "+discardcorrupt",
      "-headers",
      `X-Radiko-Authtoken: ${auth.authToken}\r\nX-Radiko-AreaId: ${auth.areaId}`,
      "-user_agent",
      "Lavf/58.76.100",
      "-http_seekable",
      "0",
      "-seekable",
      "0",
      "-i",
      streamUrl,
      "-acodec",
      "copy",
      "-vn",
      "-bsf:a",
      "aac_adtstoasc",
      "-y",
      chunkFile,
    ];

    const { success, stderr } = await ffmpeg(args);
    if (!success) {
      const error = new TextDecoder().decode(stderr);
      throw new RecRadikoError(`ffmpeg chunk download failed: ${error}`);
    }

    chunkFiles.push(chunkFile);

    // get actual chunk duration
    const chunkSec = await getDuration(chunkFile);
    const diff = chunkLen - chunkSec;
    console.log(
      `chunk ${chunkNo}: requested=${chunkLen}s, actual=${chunkSec}s, diff=${diff.toFixed(
        1,
      )}s`,
    );
    totalRequestedSec += chunkLen;
    totalActualSec += chunkSec;

    leftSec -= chunkSec;
    seekTimestamp += chunkSec;
    chunkNo++;
  }

  console.log(
    `chunks total: expected=${expectedTotal}s, requested=${totalRequestedSec}s, actual=${totalActualSec}s, diff=${(
      expectedTotal - totalActualSec
    ).toFixed(1)}s`,
  );
  return chunkFiles;
}

async function concatChunks(
  chunkFiles: string[],
  program: Program,
): Promise<void> {
  const fileListPath = `${Env.writableDir}/filelist.txt`;
  const fileListContent = chunkFiles.map((f) => `file '${f}'`).join("\n");
  fs.writeFileSync(fileListPath, fileListContent);

  const args = [
    "-loglevel",
    "error",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    fileListPath,
    "-c:a",
    "libmp3lame",
    "-b:a",
    "128k",
    "-metadata",
    `title=${program.title}`,
    "-metadata",
    `artist=${program.artist}`,
    "-metadata",
    `year=${program.year}`,
    "-y",
    program.outputFileName,
  ];

  const { success, stderr } = await ffmpeg(args);
  if (!success) {
    const error = new TextDecoder().decode(stderr);
    throw new RecRadikoError(`ffmpeg concat failed: ${error}`);
  }

  fs.rmSync(fileListPath);
}
