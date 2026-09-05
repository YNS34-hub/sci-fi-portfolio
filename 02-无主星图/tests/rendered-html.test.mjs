import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: {
        accept: "text/html",
        host: "localhost",
        "x-forwarded-proto": "http",
      },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the complete Chinese science-fiction atlas", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /无主星图/);
  assert.match(html, /有些世界/);
  assert.match(html, /非接触公约/);
  assert.match(html, /弥涌/);
  assert.match(html, /葳昼/);
  assert.match(html, /斜暮/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/);
});

test("keeps all nine cinematic records and the archive deliverables wired", async () => {
  const source = await readFile(
    new URL("../app/AtlasExperience.tsx", import.meta.url),
    "utf8",
  );
  const shotPaths = [
    ...source.matchAll(/\/worlds\/(miyong|weizhou|xiemu)\/shot-0[1-3]\.webp/g),
  ].map((match) => match[0]);

  assert.equal(new Set(shotPaths).size, 9);
  assert.match(source, /\/worlds\/series-overview\.webp/);

  await Promise.all([
    access(new URL("../public/worlds/series-overview.webp", import.meta.url)),
    access(new URL("../public/worlds/miyong/triptych.webp", import.meta.url)),
    access(new URL("../public/worlds/weizhou/triptych.webp", import.meta.url)),
    access(new URL("../public/worlds/xiemu/triptych.webp", import.meta.url)),
    access(new URL("../public/og.png", import.meta.url)),
  ]);
});
