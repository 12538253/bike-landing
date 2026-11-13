import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readExport = (path) => readFile(new URL(`../out/${path}`, import.meta.url), "utf8");

test("search engines can discover the information pages from home and the sitemap", async () => {
  const [home, sitemap] = await Promise.all([readExport("index.html"), readExport("sitemap.xml")]);
  for (const path of ["/about", "/visit-purchase"]) {
    assert.ok(home.includes(`href="${path}"`), `home must link to ${path}`);
    assert.ok(sitemap.includes(`<loc>https://www.bike-manager.com${path}</loc>`));
  }
  const support = home.match(/<section\b(?=[^>]*id="faq")[^>]*>[\s\S]*?<\/section>/)?.[0];
  assert.ok(support?.includes('href="/visit-purchase"'), "visitors reading the FAQ must be able to open the full purchase guide");
});

for (const { path, title } of [
  { path: "about", title: "바이크매니저 소개" },
  { path: "visit-purchase", title: "중고 오토바이 방문 매입 안내" },
]) {
  test(`${path} serves readable content with its own canonical and sharing metadata`, async () => {
    const html = await readExport(`${path}.html`);
    const url = `https://www.bike-manager.com/${path}`;
    assert.ok(html.includes(`<link rel="canonical" href="${url}"/>`));
    assert.ok(html.includes(`<meta property="og:url" content="${url}"/>`));
    assert.ok(html.includes(title));
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
    assert.ok(html.includes('href="tel:010-7616-4949"'));
    assert.ok(html.includes('href="https://pf.kakao.com/_MzgSn/chat"'));
    assert.ok(html.includes('href="/#process"'), "subpage navigation must return to home sections");
    assert.doesNotMatch(html, /<meta name="robots" content="[^"]*noindex/);
  });
}

test("business identity links only to the known official profiles", async () => {
  const html = await readExport("index.html");
  const [script] = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  const business = JSON.parse(script[1]);
  assert.deepEqual(business.sameAs, [
    "https://m.blog.naver.com/bikemanager4949",
    "https://naver.me/F1rPbAcV",
    "https://pf.kakao.com/_MzgSn",
  ]);
  assert.ok(business.description.includes("방문"));
  assert.equal(business.openingHoursSpecification, undefined, "24-hour enquiries are not store opening hours");
});
