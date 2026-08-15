import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import test from "node:test";

const appChunksDirectory = new URL("../out/_next/static/chunks/app/", import.meta.url);

test("page-specific client JavaScript stays within the 35KB gzip budget", async () => {
  const chunkNames = (await readdir(appChunksDirectory)).filter(
    (name) => /^(layout|page)-.+\.js$/.test(name),
  );
  assert.ok(chunkNames.length >= 2, "expected layout and page client chunks");

  let gzipBytes = 0;
  for (const chunkName of chunkNames) {
    const source = await readFile(new URL(chunkName, appChunksDirectory));
    gzipBytes += gzipSync(source).byteLength;
  }

  assert.ok(
    gzipBytes <= 35 * 1024,
    `page-specific client JavaScript is ${Math.ceil(gzipBytes / 1024)}KB gzip`,
  );
});
