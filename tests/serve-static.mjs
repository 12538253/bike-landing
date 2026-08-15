import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { constants, createBrotliCompress } from "node:zlib";

const root = new URL("../out/", import.meta.url).pathname;
const port = 4173;

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

const compressibleExtensions = new Set([".css", ".html", ".js", ".json", ".svg", ".txt", ".xml"]);

createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? "/", `http://${request.headers.host}`).pathname);
  const relativePath = normalize(pathname === "/" ? "index.html" : pathname.replace(/^\/+/, ""));
  const filePath = join(root, relativePath);

  if (!filePath.startsWith(root)) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  try {
    const fileStat = await stat(filePath);
    const resolvedPath = fileStat.isDirectory() ? join(filePath, "index.html") : filePath;
    const extension = extname(resolvedPath);
    response.setHeader("Content-Type", contentTypes[extension] ?? "application/octet-stream");
    response.setHeader(
      "Cache-Control",
      resolvedPath.includes("/_next/static/")
        ? "public, max-age=31536000, immutable"
        : extension === ".html"
          ? "public, max-age=0, must-revalidate"
          : "public, max-age=86400",
    );

    const acceptsBrotli = request.headers["accept-encoding"]?.includes("br");
    if (acceptsBrotli && compressibleExtensions.has(extension)) {
      response.setHeader("Content-Encoding", "br");
      response.setHeader("Vary", "Accept-Encoding");
      createReadStream(resolvedPath)
        .pipe(
          createBrotliCompress({
            params: { [constants.BROTLI_PARAM_QUALITY]: 4 },
          }),
        )
        .pipe(response);
      return;
    }

    createReadStream(resolvedPath).pipe(response);
  } catch {
    response.writeHead(404).end("Not found");
  }
}).listen(port, "127.0.0.1");
