import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");
const indexPath = resolve(dist, "index.html");
assert.ok(existsSync(indexPath), "dist/index.html is missing");

const html = readFileSync(indexPath, "utf8");
assert.match(html, /一毫米之外 \/ ONE MILLIMETRE OFF/);
assert.doesNotMatch(html, /https?:\/\/(?!127\.0\.0\.1)/, "build must not use remote assets");
assert.match(html, /Content-Security-Policy/);
assert.match(html, /connect-src 'self'/);

const resourcePattern = /(?:src|href)="(\/[^"?#]+)"/g;
const resources = [...html.matchAll(resourcePattern)].map((match) => match[1]);
assert.ok(resources.length >= 3, "expected bundled JS, CSS, font or favicon resources");

for (const resource of resources) {
  const filePath = resolve(dist, resource.replace(/^\//, ""));
  assert.ok(existsSync(filePath), `missing build resource: ${resource}`);
}

const cssPath = resolve(
  dist,
  resources.find((resource) => resource.endsWith(".css"))?.replace(/^\//, "") ?? "",
);
const css = readFileSync(cssPath, "utf8");
assert.match(css, /fonts\/geist\.woff2/);
assert.ok(existsSync(resolve(dist, "fonts", "geist.woff2")), "local Geist font is missing");

console.log(`static build verified: ${resources.length} indexed resources, no remote dependencies`);
