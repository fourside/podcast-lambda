import { putMp3 } from "./r2-client.ts";

export async function main(args: string[]) {
  const filePath = args[0];
  if (filePath === undefined) {
    console.error("path the file path");
    Deno.exit(-1);
  }

  await putMp3(filePath);
}

if (import.meta.main) {
  await main(Deno.args);
}
