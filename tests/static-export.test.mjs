import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const html = await readFile(new URL("../out/index.html", import.meta.url), "utf8");
const stylesheetHref = html.match(/href="([^"]+\.css)"/)?.[1];
assert.ok(stylesheetHref, "expected an exported stylesheet");
const stylesheet = await readFile(new URL(`../out${stylesheetHref}`, import.meta.url), "utf8");

test("exports the approved contact and canonical metadata", () => {
  assert.match(html, /<link rel="canonical" href="https:\/\/www\.bike-manager\.com"\/>/);
  assert.match(html, /010-7616-4949/);
  assert.match(html, /tel:010-7616-4949/);
  assert.doesNotMatch(html, /010-5712-0080/);
  assert.doesNotMatch(html, /G-XXXXXXXXXX/);
  assert.doesNotMatch(html, /유동영|341-05-00319/);
  assert.match(html, /<meta name="theme-color" content="#0C1A1C"\/>/);
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
  assert.match(html, /224351926598/);
  assert.match(html, /224355424035/);
  assert.match(html, /224362894515/);
  assert.doesNotMatch(html, /224347789101/);
  assert.doesNotMatch(html, /224340255184/);
  assert.match(html, /https:\/\/m\.blog\.naver\.com\/bikemanager4949/);
  assert.match(html, /처음 문의할 때 이 여덟 가지가 필요합니다/);
  assert.match(html, /하자 내역/);
  assert.match(html, /폐지 여부/);
  assert.match(html, /검사 여부/);
  assert.doesNotMatch(html, /naver-proof__mark[^>]*>N</);
  assert.doesNotMatch(html, /구독자 660/);
});

test("orders case studies around the core scooter customer", () => {
  const casesSection = html.match(/<section[^>]+id="cases"[\s\S]*?<\/section>/)?.[0];
  assert.ok(casesSection, "expected the case studies section");

  const advIndex = casesSection.indexOf("ADV350");
  const pcxIndex = casesSection.indexOf("PCX125");
  const ironIndex = casesSection.indexOf("아이언883");

  assert.ok(advIndex >= 0 && pcxIndex > advIndex && ironIndex > pcxIndex);
  assert.match(casesSection, /224362894515/);
});

test("exports the two transaction paths with local, budgeted route images", async () => {
  const transactionPaths = html.match(
    /<section\b(?=[^>]*data-testid="transaction-paths")[^>]*>[\s\S]*?<\/section>/,
  )?.[0];
  assert.ok(transactionPaths, "expected the transaction paths section");

  const textContent = (markup) => markup.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const countText = (markup, text) => textContent(markup).split(text).length - 1;
  const transactionText = textContent(transactionPaths);
  const heading = "차량은 곁에 두고, 거래 조건은 현장에서 확인하세요.";
  const introduction =
    "차량이 내 손을 떠나는 시점에 따라 확인해야 할 조건이 달라집니다. 바이크매니저는 약속한 장소로 직접 방문해 차량 상태와 최종 금액을 함께 확인합니다.";
  const directVisitTitle = "바이크매니저 직접 방문";
  const sendFirstTitle = "차량을 먼저 보내는 방식";
  const directVisitDescription =
    "바이크매니저는 약속한 장소에서 차량을 함께 확인하고, 최종 금액과 계약 내용을 안내한 뒤 입금 확인 후 상차합니다.";
  const sendFirstDescription =
    "차량을 먼저 보내는 거래라면 출발 전에 최종 금액, 감가 기준, 반환 조건과 운임 부담을 확인하세요.";
  const pathArticles = [...transactionPaths.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/g)].map(
    ([, article]) => article,
  );
  assert.equal(pathArticles.length, 2, "expected one semantic article for each path");
  const directVisit = pathArticles.find((article) => textContent(article).includes(directVisitTitle));
  const sendFirst = pathArticles.find((article) => textContent(article).includes(sendFirstTitle));
  assert.ok(directVisit, "expected a direct-visit path article");
  assert.ok(sendFirst, "expected a send-first path article");

  const assertOrderedSteps = (article, steps, label) => {
    const orderedList = article.match(/<ol\b[^>]*>([\s\S]*?)<\/ol>/)?.[1];
    assert.ok(orderedList, `expected ${label} to use a semantic ordered list`);
    const items = [...orderedList.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map(([, item]) => textContent(item));
    assert.deepEqual(items, steps, `expected ${label} steps in order`);
  };

  assert.equal(countText(transactionPaths, heading), 1, "expected one transaction paths heading");
  assert.equal(countText(transactionPaths, introduction), 1, "expected one transaction paths introduction");
  assert.equal(countText(directVisit, directVisitTitle), 1, "expected direct visit copy once");
  assert.equal(countText(directVisit, directVisitDescription), 1, "expected direct visit description once");
  assert.equal(countText(sendFirst, sendFirstTitle), 1, "expected send-first copy once");
  assert.equal(countText(sendFirst, sendFirstDescription), 1, "expected send-first description once");
  assert.ok(textContent(directVisit).includes("입금 확인"), "expected the payment-confirmation card copy");
  assert.equal(countText(directVisit, "확인 후 상차"), 1, "expected one loading-confirmation card copy");
  assert.equal(countText(directVisit, "사진 보내고 방문 일정 확인"), 1, "expected one direct-visit CTA");
  assertOrderedSteps(
    directVisit,
    ["방문 일정 조율", "현장에서 함께 검수", "최종 금액 확인", "입금 확인", "상차"],
    "direct visit",
  );
  assertOrderedSteps(
    sendFirst,
    ["출발 전 최종 금액과 감가 기준 확인", "금액 변경 시 반환 조건 확인", "왕복 운임 부담 확인"],
    "send first",
  );
  assert.ok(
    transactionText.indexOf(directVisitTitle) < transactionText.indexOf(sendFirstTitle),
    "expected direct visit to precede send-first in the DOM",
  );
  assert.equal([...html.matchAll(/data-testid="transaction-paths"/g)].length, 1, "expected one transaction paths section");
  assert.doesNotMatch(html, /거래 방식부터 비교하세요/);
  assert.doesNotMatch(html, /바이크를 보내기 전에 최종 금액과 반환 조건을 확인하세요/);
  assert.doesNotMatch(html, /차량이 내 손을 떠나는 시점이 다르면 확인해야 할 조건도 달라집니다/);

  const kakaoLink = [...directVisit.matchAll(/<a\b[^>]*>/g)]
    .map(([link]) => link)
    .find((link) => link.includes('data-cta="method-kakao"'));
  assert.ok(kakaoLink, "expected the direct-visit Kakao CTA to be a real link");
  assert.match(kakaoLink, /href="https:\/\/pf\.kakao\.com\/_MzgSn\/chat"/);

  const expectedImages = [
    { article: directVisit, label: "direct visit", imagePath: "/images/routes/direct-visit.webp" },
    { article: sendFirst, label: "send first", imagePath: "/images/routes/send-first.webp" },
  ];
  for (const { article, label, imagePath } of expectedImages) {
    const imageTags = [...article.matchAll(/<img\b[^>]*>/g)].map(([image]) => image);
    assert.ok(
      imageTags.some((image) => image.includes(`src="${imagePath}"`)),
      `expected the ${label} article to use ${imagePath}`,
    );

    const otherImagePath = imagePath === "/images/routes/direct-visit.webp"
      ? "/images/routes/send-first.webp"
      : "/images/routes/direct-visit.webp";
    assert.ok(
      imageTags.every((image) => !image.includes(`src="${otherImagePath}"`)),
      `expected the ${label} article not to use the other path image`,
    );

    const imageUrl = new URL(`../public${imagePath}`, import.meta.url);
    const [{ size }, metadata] = await Promise.all([stat(imageUrl), sharp(fileURLToPath(imageUrl)).metadata()]);
    assert.ok(metadata.width && metadata.height, `expected dimensions for ${imagePath}`);
    assert.ok(Math.max(metadata.width, metadata.height) <= 800, `${imagePath} longest edge must be <=800px`);
    assert.ok(size < 180 * 1024, `${imagePath} must be smaller than 180KB`);
  }
  assert.doesNotMatch(transactionPaths, /pstatic\.net/);
});

test("binds each case model to its official post and budgeted local image", async () => {
  const casesSection = html.match(/<section[^>]+id="cases"[\s\S]*?<\/section>/)?.[0];
  assert.ok(casesSection, "expected the case studies section");

  const expectedCases = [
    { model: "ADV350", postId: "224355424035", imagePath: "/images/cases/adv350.webp" },
    { model: "PCX125", postId: "224362894515", imagePath: "/images/cases/pcx125.webp" },
    { model: "아이언883", postId: "224351926598", imagePath: "/images/cases/iron883.webp" },
  ];
  const cards = [...casesSection.matchAll(/<article\b(?=[^>]*class="[^"]*\bcase-card\b[^"]*")[^>]*>([\s\S]*?)<\/article>/g)].map(
    ([, card]) => card,
  );
  assert.equal(cards.length, expectedCases.length);

  for (const { model, postId, imagePath } of expectedCases) {
    const matchingCard = cards.find((card) => card.includes(`<h3>${model}</h3>`));
    assert.ok(matchingCard, `expected a case card for ${model}`);
    assert.match(matchingCard, new RegExp(`href="https://m\\.blog\\.naver\\.com/bikemanager4949/${postId}"`));
    assert.match(matchingCard, new RegExp(`src="${imagePath.replaceAll("/", "\\/")}"`));
    assert.equal(casesSection.split(imagePath).length - 1, 1, `expected one ${imagePath} image`);

    const imageUrl = new URL(`../public${imagePath}`, import.meta.url);
    const [{ size }, metadata] = await Promise.all([stat(imageUrl), sharp(fileURLToPath(imageUrl)).metadata()]);
    assert.ok(metadata.width && metadata.height, `expected dimensions for ${imagePath}`);
    assert.ok(Math.max(metadata.width, metadata.height) <= 800, `${imagePath} longest edge must be <=800px`);
    assert.ok(size < 180 * 1024, `${imagePath} must be smaller than 180KB`);
  }
  assert.doesNotMatch(casesSection, /pstatic\.net/);
});

test("declares image tooling as a direct development dependency", async () => {
  const [packageJson, packageLock] = await Promise.all([
    readFile(new URL("../package.json", import.meta.url), "utf8").then(JSON.parse),
    readFile(new URL("../package-lock.json", import.meta.url), "utf8").then(JSON.parse),
  ]);
  const sharpVersion = packageJson.devDependencies?.sharp ?? "";
  assert.match(sharpVersion, /^\d+\.\d+\.\d+$/);
  assert.equal(packageLock.packages?.[""]?.devDependencies?.sharp, sharpVersion);
  assert.equal(packageLock.packages?.["node_modules/sharp"]?.version, sharpVersion);
});

test("keeps JSON-LD factual and free of unverified hours", () => {
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 1);

  const data = JSON.parse(scripts[0][1]);
  assert.equal(data.telephone, "010-7616-4949");
  assert.equal(data.url, "https://www.bike-manager.com");
  assert.equal(data.address.streetAddress, "백범로 411 1층");
  assert.equal(data.priceRange, undefined);
  assert.equal(data.openingHoursSpecification, undefined);
});

test("removes fabricated social proof and fake live activity", () => {
  assert.doesNotMatch(html, /후기 89개/);
  assert.doesNotMatch(html, /실시간 구매/);
  assert.doesNotMatch(html, /네이버 인증 업체/);
  assert.doesNotMatch(html, /당근마켓 인증 업체/);
  assert.doesNotMatch(html, />[^<]*(?:최고가|1분|2시간 보장|100%|모든 차량)[^<]*</);
});

test("exports the approved petrol, ivory, brass, and copper palette", () => {
  assert.match(stylesheet, /--ink:#0c1a1c/);
  assert.match(stylesheet, /--paper:#f1ede4/);
  assert.match(stylesheet, /--card:#ded7ca/);
  assert.match(stylesheet, /--orange:#ff6645/);
  assert.match(stylesheet, /--brass:#b88a4a/);
  assert.match(stylesheet, /--steel:#789094/);
  assert.doesNotMatch(stylesheet, /255,122,26|#10100f/);
});
