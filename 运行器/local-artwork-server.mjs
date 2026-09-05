import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { resolve, sep, extname } from "node:path";
import { pathToFileURL } from "node:url";

function readArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const projectDirectory = resolve(readArgument("--project") ?? "");
const port = Number.parseInt(readArgument("--port") ?? "", 10);
const hostname = "127.0.0.1";
const distributionDirectory = resolve(projectDirectory, "dist");
const workerClientDirectory = resolve(distributionDirectory, "client");
const clientDirectory = existsSync(workerClientDirectory)
  ? workerClientDirectory
  : distributionDirectory;
const workerPath = resolve(projectDirectory, "dist", "server", "index.js");
const hasWorker = existsSync(workerPath);

if (!projectDirectory || !Number.isInteger(port)) {
  throw new Error("usage: node local-artwork-server.mjs --project PROJECT --port PORT");
}

if (
  !existsSync(clientDirectory) ||
  (!hasWorker && !existsSync(resolve(clientDirectory, "index.html")))
) {
  throw new Error(`Incomplete local build: ${projectDirectory}`);
}

const contentTypes = new Map([
  [".avif", "image/avif"],
  [".css", "text/css; charset=utf-8"],
  [".gif", "image/gif"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
]);

function assetPathFromUrl(url) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(url).pathname);
  } catch {
    return null;
  }

  const relativePath = pathname.replace(/^\/+/, "");
  if (!relativePath) {
    return null;
  }

  const candidate = resolve(clientDirectory, relativePath);
  const clientPrefix = `${clientDirectory}${sep}`;
  if (!candidate.startsWith(clientPrefix)) {
    return null;
  }

  try {
    return statSync(candidate).isFile() ? candidate : null;
  } catch {
    return null;
  }
}

function createAssetResponse(request) {
  const filePath = assetPathFromUrl(request.url);
  if (!filePath) {
    return new Response("Not found", { status: 404 });
  }

  const body = request.method === "HEAD" ? null : createReadStream(filePath);
  return new Response(body, {
    status: 200,
    headers: {
      "cache-control": "no-cache",
      "content-type": contentTypes.get(extname(filePath).toLowerCase()) ??
        "application/octet-stream",
    },
  });
}

let worker = null;
if (hasWorker) {
  const workerUrl = pathToFileURL(workerPath);
  workerUrl.searchParams.set("local-artwork", String(Date.now()));
  const workerModule = await import(workerUrl.href);
  worker = workerModule.default;
}

const environment = {
  ASSETS: {
    fetch: async (request) => createAssetResponse(request),
  },
};

const executionContext = {
  waitUntil() {},
  passThroughOnException() {},
};

const server = createServer(async (incoming, outgoing) => {
  try {
    const requestUrl = new URL(
      incoming.url ?? "/",
      `http://${incoming.headers.host ?? `${hostname}:${port}`}`,
    );

    const filePath = assetPathFromUrl(requestUrl);
    if (filePath && (incoming.method === "GET" || incoming.method === "HEAD")) {
      outgoing.statusCode = 200;
      outgoing.setHeader(
        "content-type",
        contentTypes.get(extname(filePath).toLowerCase()) ??
          "application/octet-stream",
      );
      outgoing.setHeader("cache-control", "no-cache");
      if (incoming.method === "HEAD") {
        outgoing.end();
      } else {
        createReadStream(filePath).pipe(outgoing);
      }
      return;
    }

    const headers = new Headers();
    for (const [name, value] of Object.entries(incoming.headers)) {
      if (Array.isArray(value)) {
        for (const item of value) headers.append(name, item);
      } else if (value !== undefined) {
        headers.set(name, value);
      }
    }

    const request = new Request(requestUrl, {
      method: incoming.method,
      headers,
    });
    let response;
    if (worker) {
      response = await worker.fetch(request, environment, executionContext);
    } else if (incoming.method === "GET" || incoming.method === "HEAD") {
      const indexUrl = new URL("/index.html", requestUrl);
      response = createAssetResponse(
        new Request(indexUrl, {
          method: incoming.method,
          headers,
        }),
      );
    } else {
      response = new Response("Not found", { status: 404 });
    }

    // Some static SPA workers only fall back to index.html when the client
    // sends an explicit text/html Accept header. The local launcher also
    // probes routes with PowerShell, whose default header is */*. Preserve a
    // successful worker response, but make extensionless GET/HEAD routes
    // reliably open the local app shell without involving any online login.
    if (
      worker &&
      response.status === 404 &&
      (incoming.method === "GET" || incoming.method === "HEAD") &&
      !requestUrl.pathname.startsWith("/api/") &&
      extname(requestUrl.pathname) === ""
    ) {
      const indexUrl = new URL("/index.html", requestUrl);
      response = createAssetResponse(
        new Request(indexUrl, {
          method: incoming.method,
          headers,
        }),
      );
    }

    outgoing.statusCode = response.status;
    for (const [name, value] of response.headers) {
      if (
        name.toLowerCase() !== "connection" &&
        name.toLowerCase() !== "transfer-encoding"
      ) {
        outgoing.setHeader(name, value);
      }
    }

    if (!response.body || incoming.method === "HEAD") {
      outgoing.end();
      return;
    }

    const bytes = Buffer.from(await response.arrayBuffer());
    outgoing.end(bytes);
  } catch (error) {
    outgoing.statusCode = 500;
    outgoing.setHeader("content-type", "text/plain; charset=utf-8");
    outgoing.end("本地作品启动失败。");
    console.error(error);
  }
});

server.listen(port, hostname, () => {
  console.log(`LOCAL_ARTWORK_READY http://${hostname}:${port}/`);
});
