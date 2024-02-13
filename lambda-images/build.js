const esbuild = require("esbuild");
const { sentryEsbuildPlugin } = require("@sentry/esbuild-plugin");

const srcPathConfig = {
  cron: "src/cron/index.ts",
  "spot-task": "src/spot-task/index.ts",
};

const srcPath = srcPathConfig[process.argv[2]];
if (srcPath === undefined) {
  new Error(`invalid src type: ${process.argv[2]}`);
}

(async () => {
  const result = await esbuild.build({
    entryPoints: [srcPath],
    bundle: true,
    minify: true,
    target: "es2020",
    sourcemap: true,
    outdir: "dist",
    platform: "node",
    plugins: [
      sentryEsbuildPlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: "fourside",
        project: "podcast-lambda",
      }),
    ],
  });

  console.log(result);
})();
