import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const distRoot = path.join(projectRoot, "dist");
const indexPath = path.join(distRoot, "index.html");

function fail(message) {
  throw new Error(`static verification failed: ${message}`);
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

if (!existsSync(indexPath)) fail("dist/index.html is missing");
const files = walk(distRoot);
if (files.length < 3) fail("formal build contains too few files");

const indexHtml = readFileSync(indexPath, "utf8");
if (!indexHtml.includes("Content-Security-Policy")) fail("Content Security Policy is missing");
if (!indexHtml.includes("三小时之后")) fail("expected artwork identity is missing");

const resourceUrls = [...indexHtml.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map((match) => match[1]);
for (const resourceUrl of resourceUrls) {
  if (/^(?:https?:)?\/\//i.test(resourceUrl)) fail(`remote index resource: ${resourceUrl}`);
  if (resourceUrl.startsWith("data:") || resourceUrl.startsWith("#")) continue;
  const clean = resourceUrl.split(/[?#]/)[0].replace(/^\.\//, "").replace(/^\//, "");
  if (!existsSync(path.join(distRoot, clean))) fail(`missing indexed resource: ${resourceUrl}`);
}

const textExtensions = new Set([".html", ".css", ".js", ".json", ".svg", ".webmanifest"]);
const remoteReferences = [];
for (const file of files) {
  const stats = statSync(file);
  if (stats.size === 0) fail(`empty build file: ${path.relative(distRoot, file)}`);
  if (!textExtensions.has(path.extname(file))) continue;
  const content = readFileSync(file, "utf8");
  const searchable = content.replaceAll("http://www.w3.org/2000/svg", "");
  if (/https?:\/\//i.test(searchable) || /["']\/\//.test(searchable)) {
    remoteReferences.push(path.relative(distRoot, file));
  }
}
if (remoteReferences.length) fail(`remote references in ${remoteReferences.join(", ")}`);

const hashes = files
  .map((file) => ({
    file: path.relative(distRoot, file).replaceAll("\\", "/"),
    bytes: statSync(file).size,
    sha256: createHash("sha256").update(readFileSync(file)).digest("hex"),
  }))
  .sort((left, right) => left.file.localeCompare(right.file));

const artifactsRoot = path.join(projectRoot, "artifacts");
mkdirSync(artifactsRoot, { recursive: true });
writeFileSync(
  path.join(artifactsRoot, "static-verification.json"),
  `${JSON.stringify({ verifiedAt: new Date().toISOString(), resources: resourceUrls, files: hashes }, null, 2)}\n`,
  "utf8",
);

console.log(`static build verified: ${files.length} files, ${resourceUrls.length} indexed resources, 0 remote references`);
