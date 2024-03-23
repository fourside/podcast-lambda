const esbuild = require("esbuild");
const { sentryEsbuildPlugin } = require("@sentry/esbuild-plugin");

(async () => {
  const result = await esbuild.build({
    entryPoints: ["src/index.ts"],
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
