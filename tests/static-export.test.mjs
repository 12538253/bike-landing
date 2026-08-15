import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../out/index.html", import.meta.url), "utf8");

test("exports the approved contact and canonical metadata", () => {
  assert.match(html, /<link rel="canonical" href="https:\/\/www\.bike-manager\.com"\/>/);
  assert.match(html, /010-7616-4949/);
  assert.match(html, /tel:010-7616-4949/);
  assert.doesNotMatch(html, /010-5712-0080/);
  assert.doesNotMatch(html, /G-XXXXXXXXXX/);
});

test("renders the trust-first hero and trackable contact links", () => {
  assert.match(html, /바이크를 먼저 보내지 않아도 됩니다/);
  assert.match(html, /data-cta="hero-kakao"/);
  assert.match(html, /data-cta="header-phone"/);
  assert.match(html, /data-cta="sticky-kakao"/);
  assert.match(html, /data-cta="final-phone"/);
  assert.match(html, /data-cta="naver-proof"/);
  assert.match(html, /https:\/\/pf\.kakao\.com\/_MzgSn\/chat/);
  assert.match(html, /https:\/\/naver\.me\/F1rPbAcV/);
});

test("keeps JSON-LD factual and free of unverified hours", () => {
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 1);

  const data = JSON.parse(scripts[0][1]);
  assert.equal(data.telephone, "010-7616-4949");
  assert.equal(data.url, "https://www.bike-manager.com");
  assert.equal(data.address.streetAddress, "백범로 411 1층");
  assert.equal(data.openingHoursSpecification, undefined);
});

test("removes fabricated social proof and fake live activity", () => {
  assert.doesNotMatch(html, /후기 89개/);
  assert.doesNotMatch(html, /실시간 구매/);
  assert.doesNotMatch(html, /네이버 인증 업체/);
  assert.doesNotMatch(html, /당근마켓 인증 업체/);
});
