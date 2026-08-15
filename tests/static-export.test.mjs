import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const html = await readFile(new URL("../out/index.html", import.meta.url), "utf8");
const stylesheetHref = html.match(/href="([^"]+\.css)"/)?.[1];
assert.ok(stylesheetHref, "expected an exported stylesheet");
const stylesheet = await readFile(new URL(`../out${stylesheetHref}`, import.meta.url), "utf8");

const textContent = (markup) => markup
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;|&#160;|&#x0*a0;/gi, " ")
  .replace(/&amp;/gi, "&")
  .replace(/&quot;|&#34;/gi, '"')
  .replace(/&apos;|&#39;/gi, "'")
  .replace(/&lt;/gi, "<")
  .replace(/&gt;/gi, ">")
  .replace(/&rarr;/gi, "→")
  .replace(/&#x([\da-f]+);/gi, (_, codePoint) => String.fromCodePoint(Number.parseInt(codePoint, 16)))
  .replace(/&#(\d+);/g, (_, codePoint) => String.fromCodePoint(Number.parseInt(codePoint, 10)))
  .replace(/\s+/g, " ")
  .trim();

const faqAnswerContracts = [
  {
    question: "사진 견적이 최종 금액인가요?",
    facts: ["사진 견적은 예상 금액", "현장 상태", "최종 금액", "판매자가", "동의"],
  },
  {
    question: "24시간 바로 방문하나요?",
    facts: ["24시간", "문의 접수", "즉시 방문", "보장하지"],
  },
  {
    question: "번호판이 있거나 폐지 전이어도 상담할 수 있나요?",
    facts: ["등록 상태", "본인 소유", "서류"],
  },
];

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
  assert.match(html, /하자 내역/);
  assert.match(html, /폐지 여부/);
  assert.match(html, /검사 여부/);
  assert.doesNotMatch(html, /naver-proof__mark[^>]*>N</);
  assert.doesNotMatch(html, /구독자 660/);
});

test("points #process at transaction paths and exports the approved section order", () => {
  const transactionPaths = html.match(
    /<section\b(?=[^>]*id="process")(?=[^>]*data-testid="transaction-paths")[^>]*>[\s\S]*?<\/section>/,
  )?.[0];
  assert.ok(transactionPaths, "expected #process to identify the transaction paths section");

  const orderedMarkers = [
    'id="top"',
    'id="trust"',
    'id="process"',
    'id="cases"',
    'id="quote-title"',
    'id="guide-title"',
    'id="faq"',
    'id="contact"',
  ];
  const markerIndexes = orderedMarkers.map((marker) => html.indexOf(marker));
  assert.ok(markerIndexes.every((index) => index >= 0), "expected every final landing section marker");
  assert.deepEqual(
    [...markerIndexes].sort((left, right) => left - right),
    markerIndexes,
    "expected the approved hero-to-contact section order",
  );
});

test("omits standalone process, comparison, and Naver proof sections", () => {
  assert.doesNotMatch(html, /data-testid="process-story"|class="[^"]*\bprocess-story\b/);
  assert.doesNotMatch(html, /class="[^"]*\bprocess-step\b|id="process-title"/);
  assert.doesNotMatch(html, /class="[^"]*\bhonest-(?:section|layout|grid|callout)\b|id="honest-title"/);
  assert.doesNotMatch(html, /class="[^"]*\bnaver-proof(?:__[^" ]*)?\b|id="naver-title"/);
  assert.doesNotMatch(html, /차량을 먼저 맡기지 않는 현장 거래 4단계/);
  assert.doesNotMatch(html, /조금 더 받을지, 시간을 아낄지에 따라 선택이 달라집니다/);
  assert.doesNotMatch(html, /공식 블로그에서 실제 매입 기록을 확인하세요/);
});

test("retains the approved short copy and seller decision facts", () => {
  for (const requiredCopy of [
    "인천·서울·경기 중고 바이크 방문 매입",
    "사진으로 예상 견적과 방문 시간을 먼저 안내합니다. 현장에서 차량 상태와 최종 금액을 확인하고, 판매대금 입금 확인 후 상차합니다.",
    "사진 견적은 예상 금액이며, 최종 금액은 현장 상태에 따라 달라질 수 있습니다.",
    "경력 10년 이상",
    "24시간 문의 접수",
    "직접 방문·현장 확인",
    "입금 확인 후 상차",
    "실제 매입 사진과 기록을 확인하세요",
    "당시 차량 사진과 진행 내용은 각 원문에서 확인할 수 있습니다.",
    "공식 블로그에서 더 많은 사례 보기",
    "네이버 플레이스·리뷰 보기",
    "사진과 8가지 정보만 보내주세요",
    "밝은 곳에서 전체 모습과 하자 부위를 가까이 찍어주세요.",
    "스쿠터부터 대형 바이크까지 상담합니다",
    "차량 상태와 등록 정보를 확인한 뒤 매입 가능 여부와 필요한 서류를 안내합니다.",
    "명의·서류가 다른 경우",
    "보통 신분증과 이륜자동차 사용신고필증 또는 폐지증명서를 확인합니다. 타인·법인·외국인 명의, 미성년자 소유, 서류 분실, 차대번호 훼손·재타각 차량은 추가 확인이 필요합니다. 확인 결과에 따라 진행이 어렵거나 추가 서류가 필요할 수 있습니다.",
    "예상 견적과 방문 가능 시간을 안내합니다",
    "24시간 문의 접수 · 방문 전 연락",
    "네이버 지도에서 위치·리뷰 보기",
  ]) {
    assert.ok(html.includes(requiredCopy), `expected required visible copy: ${requiredCopy}`);
  }

  for (const item of ["기종", "연식", "주행거리", "하자 내역", "폐지 여부", "검사 여부", "지역", "바이크 사진"]) {
    assert.match(html, new RegExp(`>${item}<`), `expected quote item: ${item}`);
  }
});

test("moves official blog and Naver Place links into case studies", () => {
  const casesSection = html.match(/<section\b(?=[^>]*id="cases")[^>]*>[\s\S]*?<\/section>/)?.[0];
  assert.ok(casesSection, "expected the case studies section");
  assert.match(casesSection, /data-cta="naver-proof"/);
  assert.match(casesSection, /href="https:\/\/m\.blog\.naver\.com\/bikemanager4949"/);
  assert.match(casesSection, /href="https:\/\/naver\.me\/F1rPbAcV"/);
  assert.doesNotMatch(casesSection, /공식 블로그 사례|원문과 사진 보기/);
  assert.equal(casesSection.split("원문 보기").length - 1, 3, "expected one concise link per case");
});

test("exports exactly three FAQ details plus one purchase-guide details", () => {
  const faqSection = html.match(/<section\b(?=[^>]*id="faq")[^>]*>[\s\S]*?<\/section>/)?.[0];
  assert.ok(faqSection, "expected the FAQ section");
  assert.equal([...faqSection.matchAll(/<details\b/g)].length, 3, "expected exactly three FAQ details");
  assert.equal([...html.matchAll(/<details\b/g)].length, 4, "expected one separate purchase-guide details");
  for (const { question } of faqAnswerContracts) assert.ok(faqSection.includes(question));
});

for (const { question, facts } of faqAnswerContracts) {
  test(`keeps the core facts and two-sentence limit for FAQ: ${question}`, () => {
    const faqSection = html.match(/<section\b(?=[^>]*id="faq")[^>]*>[\s\S]*?<\/section>/)?.[0];
    assert.ok(faqSection, "expected the FAQ section");
    const details = [...faqSection.matchAll(/<details\b[^>]*>([\s\S]*?)<\/details>/g)]
      .map(([, markup]) => markup)
      .find((markup) => textContent(markup).includes(question));
    assert.ok(details, `expected FAQ details for: ${question}`);

    const answerMarkup = details.match(/<div\b(?=[^>]*class="[^"]*\bfaq-answer\b)[^>]*>([\s\S]*?)<\/div>/)?.[1];
    assert.ok(answerMarkup, `expected an answer for: ${question}`);
    const answer = textContent(answerMarkup);
    for (const fact of facts) assert.ok(answer.includes(fact), `expected "${fact}" in answer: ${question}`);

    const terminators = answer.match(/[.!?。！？]/gu) ?? [];
    const sentences = answer.split(/[.!?。！？]+/u).map((sentence) => sentence.trim()).filter(Boolean);
    assert.ok(sentences.length >= 1, `expected a non-empty answer: ${question}`);
    assert.ok(terminators.length <= 2, `expected at most two sentence terminators: ${question}`);
    assert.ok(sentences.length <= 2, `expected at most two sentences: ${question}`);
  });
}

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

  const countText = (markup, text) => textContent(markup).split(text).length - 1;
  const transactionText = textContent(transactionPaths);
  const heading = "차량은 곁에 두고, 거래 조건은 현장에서 확인하세요.";
  const introduction =
    "약속한 장소에서 차량 상태와 최종 금액을 함께 확인합니다.";
  const directVisitTitle = "바이크매니저 직접 방문";
  const sendFirstTitle = "차량을 먼저 보내는 방식";
  const directVisitDescription =
    "약속한 장소에서 차량을 함께 확인하고, 최종 금액 안내와 입금 확인을 마친 뒤 상차합니다.";
  const sendFirstDescription =
    "차량을 먼저 보낸다면 출발 전에 최종 금액, 감가 기준, 반환 조건과 왕복 운임을 확인하세요.";
  const pathArticles = [...transactionPaths.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/g)].map(
    ([, article]) => article,
  );
  assert.equal(pathArticles.length, 2, "expected one semantic article for each path");
  const directVisit = pathArticles.find((article) => textContent(article).includes(directVisitTitle));
  const sendFirst = pathArticles.find((article) => textContent(article).includes(sendFirstTitle));
  assert.ok(directVisit, "expected a direct-visit path article");
  assert.ok(sendFirst, "expected a send-first path article");

  const assertOrderedSteps = (article, title, description, steps, label) => {
    const articleText = textContent(article);
    const titleStart = articleText.indexOf(title);
    const titleEnd = titleStart + title.length;
    const descriptionStart = articleText.indexOf(description);
    assert.ok(titleStart >= 0 && descriptionStart > titleEnd, `expected ${label} steps before its description`);

    // "입금 확인" also belongs to the direct path's explanatory copy and confirmation card.
    // The title-to-description span is the content-defined step group, independent of its wrappers.
    const stepsText = articleText.slice(titleEnd, descriptionStart);
    let previousIndex = -1;
    for (const step of steps) {
      const stepIndex = stepsText.indexOf(step);
      assert.ok(stepIndex >= 0, `expected ${label} step: ${step}`);
      assert.equal(
        stepsText.indexOf(step, stepIndex + step.length),
        -1,
        `expected one ${label} step: ${step}`,
      );
      assert.ok(stepIndex > previousIndex, `expected ${label} step order to include ${step}`);
      previousIndex = stepIndex;
    }
  };

  assert.equal(countText(transactionPaths, heading), 1, "expected one transaction paths heading");
  assert.equal(countText(transactionPaths, introduction), 1, "expected one transaction paths introduction");
  assert.equal(countText(directVisit, directVisitTitle), 1, "expected direct visit copy once");
  assert.equal(countText(directVisit, directVisitDescription), 1, "expected direct visit description once");
  assert.equal(countText(sendFirst, sendFirstTitle), 1, "expected send-first copy once");
  assert.equal(countText(sendFirst, sendFirstDescription), 1, "expected send-first description once");
  assert.ok(textContent(directVisit).includes("입금 확인"), "expected the payment-confirmation card copy");
  assert.equal(countText(transactionPaths, "개인 거래는 가격 면에서 더 유리할 수 있습니다. 업체 매입은 시간과 절차를 줄이는 방식입니다."), 1);
  assertOrderedSteps(
    directVisit,
    directVisitTitle,
    directVisitDescription,
    ["방문 일정", "현장 확인", "최종 금액", "입금 확인", "상차"],
    "direct visit",
  );
  assertOrderedSteps(
    sendFirst,
    sendFirstTitle,
    sendFirstDescription,
    ["최종 금액·감가 기준", "반환 조건", "왕복 운임"],
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

test("keys responsive case image size hints by content layout", async () => {
  const component = await readFile(new URL("../components/CaseStudies.tsx", import.meta.url), "utf8");

  assert.match(component, /featured:\s*"\(max-width: 760px\) 100vw, \(max-width: 1119px\) 67vw, 50vw"/);
  assert.match(component, /portrait:\s*"\(max-width: 760px\) 100vw, \(max-width: 1119px\) 33vw, 25vw"/);
  assert.match(component, /sizes=\{caseImageSizes\[caseStudy\.layout\]\}/);
  assert.doesNotMatch(component, /sizes="\(max-width: 760px\) 100vw, 33vw"/);
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
