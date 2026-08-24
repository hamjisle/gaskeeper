#!/usr/bin/env node
// Regenerates offline-game/index.html from offline-game/template.html by:
//   1. Bundling app/game-data.ts + app/game-renderer.ts (type-stripped) into a
//      single minified IIFE exposed as window.GK, via esbuild.
//   2. Inlining the current app/globals.css verbatim.
// This keeps the offline build's game data, balance, and visuals permanently
// in sync with the online app — re-run this after any change to
// app/game-data.ts, app/game-renderer.ts, or app/globals.css.
import { build } from "esbuild";
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const entryPath = join(root, "app", "_offline-bundle-entry.ts");

writeFileSync(entryPath, `export * from "./game-data";\nexport * from "./game-renderer";\n`);

try {
  const result = await build({
    entryPoints: [entryPath],
    bundle: true,
    format: "iife",
    globalName: "GK",
    target: "es2019",
    minify: true,
    write: false,
  });
  const bundleCode = result.outputFiles[0].text;
  const css = readFileSync(join(root, "app", "globals.css"), "utf8");
  const template = readFileSync(join(root, "offline-game", "template.html"), "utf8");

  if (!template.includes("/*__GASKEEPER_CORE_BUNDLE__*/")) {
    throw new Error("template.html is missing the /*__GASKEEPER_CORE_BUNDLE__*/ placeholder");
  }
  if (!template.includes("/*__GASKEEPER_CSS__*/")) {
    throw new Error("template.html is missing the /*__GASKEEPER_CSS__*/ placeholder");
  }

  const output = template
    .replace("/*__GASKEEPER_CORE_BUNDLE__*/", bundleCode)
    .replace("/*__GASKEEPER_CSS__*/", css);

  writeFileSync(join(root, "offline-game", "index.html"), output);
  console.log(
    `offline-game/index.html generated (core bundle ${(bundleCode.length / 1024).toFixed(1)}KB, css ${(css.length / 1024).toFixed(1)}KB)`
  );
} finally {
  rmSync(entryPath, { force: true });
}
