import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
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

const prohibitedMarketingTerms = /최고가|무조건|100%|즉시 출동|모든 차량|전 기종/u;

const marketingSurface = (markup) => {
  const withoutExecutableCode = markup
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "");
  const titles = [...markup.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)].map(([, value]) => textContent(value));
  const metadata = [...markup.matchAll(/<meta\b[^>]*\bcontent=(?:"([^"]*)"|'([^']*)')/gi)]
    .map(([, doubleQuoted, singleQuoted]) => doubleQuoted ?? singleQuoted);
  const ariaLabels = [...withoutExecutableCode.matchAll(/\baria-label=(?:"([^"]*)"|'([^']*)')/gi)]
    .map(([, doubleQuoted, singleQuoted]) => doubleQuoted ?? singleQuoted);
  const jsonLd = [...markup.matchAll(
    /<script\b[^>]*\btype=(?:"application\/ld\+json"|'application\/ld\+json')[^>]*>([\s\S]*?)<\/script>/gi,
  )].map(([, value]) => value);

  return [...titles, ...metadata, ...ariaLabels, textContent(withoutExecutableCode), ...jsonLd].join(" ");
};

const disclosureParts = (detailsMarkup) => {
  const match = detailsMarkup.match(/<summary\b[^>]*>([\s\S]*?)<\/summary>([\s\S]*)/i);
  if (!match) return null;
  return {
    summary: textContent(match[1]),
    content: textContent(match[2]),
  };
};

const faqAnswerContracts = [
  {
    question: "최종 금액은 어떻게 정하나요?",
    answer:
      "사진으로 예상 금액을 먼저 안내합니다. 현장에서 차량과 서류를 함께 확인하고, 변동 사유와 최종 금액을 설명드린 뒤 동의하신 금액으로 거래합니다.",
    facts: ["사진으로 예상 금액", "차량과 서류", "변동 사유", "최종 금액", "동의하신 금액"],
  },
  {
    question: "방문 시간은 어떻게 정하나요?",
    answer:
      "문의는 24시간 접수합니다. 인천·서울·경기 지역과 당일 일정을 확인해 방문 가능한 시간을 안내하며, 늦은 시간도 일정에 맞춰 조율합니다.",
    facts: ["24시간", "인천·서울·경기", "당일 일정", "방문 가능한 시간", "늦은 시간"],
  },
  {
    question: "개인 거래와 업체 매입은 어떻게 다른가요?",
    answer:
      "일정 조율과 현장 처리를 한 번에 마치고 싶다면 업체 매입이 잘 맞습니다. 가격을 가장 우선한다면 개인 거래도 함께 비교해 보세요.",
    facts: ["일정 조율", "현장 처리", "업체 매입", "가격", "개인 거래"],
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

test("exports a budgeted production-canonical Open Graph JPEG", async () => {
  const ogImagePath = "/images/og-bike-manager.jpg";
  const ogImage = new URL(`../out${ogImagePath}`, import.meta.url);
  const [{ size }, metadata, pixels] = await Promise.all([
    stat(ogImage),
    sharp(fileURLToPath(ogImage)).metadata(),
    sharp(fileURLToPath(ogImage)).raw().toBuffer(),
  ]);

  assert.equal(metadata.format, "jpeg", "the exported Open Graph asset must be a JPEG");
  assert.equal(metadata.width, 1200, "the exported Open Graph JPEG must be 1200px wide");
  assert.equal(metadata.height, 630, "the exported Open Graph JPEG must be 630px tall");
  assert.equal(pixels.byteLength, 1200 * 630 * 3, "the exported Open Graph JPEG must fully decode to its RGB pixels");
  assert.ok(size <= 180 * 1024, `the exported Open Graph JPEG is ${Math.ceil(size / 1024)}KB`);
  assert.match(
    html,
    /<meta property="og:image" content="https:\/\/www\.bike-manager\.com\/images\/og-bike-manager\.jpg"\/>/,
    "Open Graph metadata must use the production canonical origin",
  );
  assert.doesNotMatch(html, /og:image" content="https?:\/\/[^\"]*(?:pages\.dev|localhost|127\.0\.0\.1)/);
});

test("rejects a truncated Open Graph JPEG even when its header metadata is readable", async () => {
  const fixtureDirectory = await mkdtemp(join(tmpdir(), "bike-manager-og-"));
  const fixturePath = join(fixtureDirectory, "truncated-og.jpg");

  try {
    const exportedOgImage = await readFile(new URL("../out/images/og-bike-manager.jpg", import.meta.url));
    await writeFile(fixturePath, exportedOgImage.subarray(0, 500));

    const metadata = await sharp(fixturePath).metadata();
    assert.equal(metadata.format, "jpeg", "the fixture must prove that header metadata alone is insufficient");
    assert.equal(metadata.width, 1200);
    assert.equal(metadata.height, 630);
    await assert.rejects(
      sharp(fixturePath).raw().toBuffer(),
      undefined,
      "the truncated fixture must fail a complete pixel decode",
    );
  } finally {
    await rm(fixtureDirectory, { recursive: true, force: true });
  }
});

test("exports only the approved BM favicon asset", async () => {
  assert.match(html, /<link rel="icon" href="\/favicon\.png" type="image\/png"\/>/);
  assert.match(html, /<link rel="apple-touch-icon" href="\/favicon\.png"\/>/);
  assert.doesNotMatch(html, /href="\/favicon\.ico(?:\?[^\"]*)?"/);

  const approvedIcon = await stat(new URL("../out/favicon.png", import.meta.url));
  assert.ok(approvedIcon.isFile(), "expected the approved PNG favicon in the static export");
  await assert.rejects(
    stat(new URL("../out/favicon.ico", import.meta.url)),
    (error) => error?.code === "ENOENT",
    "the stock Next favicon must not be emitted",
  );
});

test("renders the benefit-led hero and trackable contact links", () => {
  assert.match(html, /바이크는 그대로 두세요/);
  assert.match(html, /직접 찾아가 매입합니다/);
  assert.match(html, /data-cta="hero-kakao"/);
  const finalSection = html.match(/<section\b(?=[^>]*id="contact")[^>]*>[\s\S]*?<\/section>/)?.[0];
  assert.ok(finalSection, "expected the final contact section");
  assert.match(finalSection, /data-cta="final-kakao"/, "the final Kakao CTA must render its configured tracking ID");
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

test("points #process at the sequential visit flow and exports the approved section order", () => {
  const visitFlow = html.match(
    /<section\b(?=[^>]*id="process")(?=[^>]*data-testid="visit-flow")[^>]*>[\s\S]*?<\/section>/,
  )?.[0];
  assert.ok(visitFlow, "expected #process to identify the visit-flow section");

  const orderedMarkers = [
    'id="top"',
    'id="trust"',
    'id="process"',
    'id="cases"',
    'id="quote-title"',
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
    "바이크는 그대로 두세요.",
    "직접 찾아가 매입합니다.",
    "24시간 문의 접수",
    "인천·서울·경기 직접 방문",
    "스쿠터부터 대형 바이크까지",
    "공식 블로그 실제 사례",
    "공식 블로그에 남긴 실제 매입 기록입니다.",
    "늦은 저녁 자택 방문 · 현장 확인 후 대금 지급",
    "공식 블로그 매입 기록",
    "공식 블로그에서 더 많은 사례 보기",
    "네이버 플레이스·리뷰 보기",
    "사진 몇 장과 기본 정보만 보내주세요.",
    "밝은 곳에서 차량 전체와 확인이 필요한 부위를 가까이 찍어주세요.",
    "스쿠터부터 대형 바이크까지 상담합니다.",
    "차량 상태와 등록 정보를 확인해 진행 가능 여부와 필요한 서류를 안내합니다.",
    "명의·서류가 다른 경우",
    "사진으로 예상 견적과 방문 시간을 먼저 안내합니다. 약속한 장소에서 차량과 최종 금액을 함께 확인하고, 판매대금 전액 입금 후 상차합니다.",
    "경력 10년 이상 · 입금 확인 후 상차",
    "진행 방법 보기",
    "사진 보내고 예상 견적 확인",
    "전화로 차량 상담하기",
    "예상 견적부터 방문 일정까지 빠르게 안내합니다.",
    "24시간 문의 접수 · 방문 전 연락",
    "네이버 지도에서 위치·리뷰 보기",
  ]) {
    assert.ok(html.includes(requiredCopy), `expected required visible copy: ${requiredCopy}`);
  }

  assert.doesNotMatch(html, /저희가 직접 찾아가 매입합니다\./u, "expected the superseded hero title to be absent");

  for (const item of ["기종", "연식", "주행거리", "하자 내역", "폐지 여부", "검사 여부", "지역", "바이크 사진"]) {
    assert.match(html, new RegExp(`>${item}<`), `expected quote item: ${item}`);
  }
});

test("keeps full sale-payment wording before loading the bike", () => {
  const hero = html.match(/<section\b(?=[^>]*id="top")[^>]*>[\s\S]*?<\/section>/)?.[0];
  assert.ok(hero, "expected the hero section");
  const heroText = textContent(hero);
  const salePaymentIndex = heroText.indexOf("판매대금 전액");
  const paymentIndex = heroText.indexOf("판매대금 전액 입금");
  const loadingIndex = heroText.indexOf("상차");

  assert.ok(salePaymentIndex >= 0, "expected the hero to state full sale-payment amount");
  assert.ok(paymentIndex >= salePaymentIndex, "expected full sale-payment wording to include payment");
  assert.ok(loadingIndex > paymentIndex, "expected loading only after payment");
});

test("omits every globally forbidden defensive phrase", () => {
  assert.doesNotMatch(
    html,
    /최종 금액은 현장 상태에 따라 달라질 수 있습니다\.|가격만 보면 개인 거래가 더 유리할 수 있습니다\.|즉시 방문을 보장하지 않습니다\.|거래가 어렵거나 서류를 더 준비해야 할 수 있습니다\.|무조건|즉시 출동/u,
  );
});

test("sources canonical landing section copy from typed site content", async () => {
  const componentUrls = [
    "../components/Header.tsx",
    "../components/Hero.tsx",
    "../components/TrustBar.tsx",
    "../components/VisitFlowSection.tsx",
    "../components/VisitFlow.tsx",
    "../components/CaseStudies.tsx",
    "../components/QuoteChecklist.tsx",
    "../components/SupportSection.tsx",
    "../components/LocationFinal.tsx",
  ];
  const [siteSource, ...componentSources] = await Promise.all([
    readFile(new URL("../content/site.ts", import.meta.url), "utf8"),
    ...componentUrls.map((path) => readFile(new URL(path, import.meta.url), "utf8")),
  ]);
  const componentSource = componentSources.join("\n");
  const canonicalCopies = [
    "사진 확인부터 현장 거래까지",
    "바이크는 그대로 두고, 사진만 보내주세요.",
    "바이크매니저가 약속한 장소로 직접 찾아갑니다.",
    "공식 블로그에 남긴 실제 매입 기록입니다.",
    "원문 보기",
    "견적 준비",
    "사진 몇 장과 기본 정보만 보내주세요.",
    "명의·서류가 다른 경우",
    "스쿠터부터 대형 바이크까지 상담합니다.",
    "차량 상태와 등록 정보를 확인해 진행 가능 여부와 필요한 서류를 안내합니다.",
    "인천 오프라인 매장",
    "방문 시간은 어떻게 정하나요?",
    "문의는 24시간 접수합니다. 인천·서울·경기 지역과 당일 일정을 확인해 방문 가능한 시간을 안내하며, 늦은 시간도 일정에 맞춰 조율합니다.",
    "예상 견적부터 방문 일정까지 빠르게 안내합니다.",
    "네이버 지도에서 위치·리뷰 보기",
    "사진부터 보내주세요.",
    "사진 보내고 예상 견적 확인",
    "전화로 차량 상담하기",
  ];

  for (const copy of canonicalCopies) {
    assert.ok(siteSource.includes(copy), `expected site.ts to own canonical copy: ${copy}`);
    assert.ok(!componentSource.includes(copy), `expected components to render canonical copy from site.ts: ${copy}`);
  }
});

test("moves official blog and Naver Place links into case studies", () => {
  const casesSection = html.match(/<section\b(?=[^>]*id="cases")[^>]*>[\s\S]*?<\/section>/)?.[0];
  assert.ok(casesSection, "expected the case studies section");
  assert.match(casesSection, /data-cta="naver-proof"/);
  assert.match(casesSection, /href="https:\/\/m\.blog\.naver\.com\/bikemanager4949"/);
  assert.match(casesSection, /href="https:\/\/naver\.me\/F1rPbAcV"/);
  assert.doesNotMatch(casesSection, /당시 차량 사진과 거래 내용은 원문에서 확인하세요/);
  assert.equal(casesSection.split("원문 보기").length - 1, 3, "expected one concise link per case");
});

test("exports one merged server-rendered support section with document and FAQ disclosures", async () => {
  const faqSection = html.match(/<section\b(?=[^>]*id="faq")[^>]*>[\s\S]*?<\/section>/)?.[0];
  assert.ok(faqSection, "expected the FAQ section");
  assert.equal([...faqSection.matchAll(/<details\b/g)].length, 4, "expected document plus three FAQ details");
  assert.equal([...html.matchAll(/<details\b/g)].length, 5, "expected support and visit-safety disclosures");
  const [pageSource, supportSource] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/SupportSection.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(pageSource, /<SupportSection\s*\/>/);
  assert.doesNotMatch(pageSource, /<PurchaseGuide\s*\/>|<FAQSection\s*\/>/);
  assert.doesNotMatch(supportSource, /"use client"|'use client'/);
  for (const { question } of faqAnswerContracts) assert.ok(faqSection.includes(question));
});

test("keeps document facts in the merged support disclosure", () => {
  const supportSection = html.match(/<section\b(?=[^>]*id="faq")[^>]*>[\s\S]*?<\/section>/)?.[0];
  assert.ok(supportSection, "expected the merged support section");
  const guideDetails = [...supportSection.matchAll(/<details\b[^>]*>([\s\S]*?)<\/details>/g)];
  const disclosure = disclosureParts(guideDetails[0]?.[1] ?? "");
  assert.ok(disclosure, "expected a native purchase-guide summary and detail content");
  assert.equal(disclosure.summary, "명의·서류가 다른 경우");
  for (const fact of [
    "신분증",
    "사용신고필증",
    "폐지증명서",
    "타인·법인·외국인 명의",
    "미성년자",
    "서류 분실",
    "차대번호",
    "현재 상태를 알려주시면",
    "필요한 확인 사항과 서류",
  ]) {
    assert.ok(disclosure.content.includes(fact), `expected purchase-guide detail fact: ${fact}`);
  }
});

test("puts final contact actions before location facts in DOM order", () => {
  const finalSection = html.match(/<section\b(?=[^>]*id="contact")[^>]*>[\s\S]*?<\/section>/)?.[0];
  assert.ok(finalSection, "expected final CTA/location section");
  assert.ok(finalSection.indexOf("사진 보내고 예상 견적 확인") < finalSection.indexOf("인천 남동구 백범로 411 1층"));
  assert.ok(finalSection.indexOf("전화로 차량 상담하기") < finalSection.indexOf("인천 남동구 백범로 411 1층"));
  assert.match(finalSection, /data-cta="final-phone"/);
});

for (const { question, answer: expectedAnswer, facts } of faqAnswerContracts) {
  test(`keeps the core facts and two-sentence limit for FAQ: ${question}`, () => {
    const faqSection = html.match(/<section\b(?=[^>]*id="faq")[^>]*>[\s\S]*?<\/section>/)?.[0];
    assert.ok(faqSection, "expected the FAQ section");
    const disclosure = [...faqSection.matchAll(/<details\b[^>]*>([\s\S]*?)<\/details>/g)]
      .map(([, markup]) => disclosureParts(markup))
      .find((candidate) => candidate?.summary === question);
    assert.ok(disclosure, `expected native FAQ details for: ${question}`);

    const answer = disclosure.content;
    assert.equal(answer, expectedAnswer, `expected canonical FAQ answer: ${question}`);
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

test("exports one sequential visit journey with neutral safety advice", () => {
  const visitFlow = html.match(
    /<section\b(?=[^>]*data-testid="visit-flow")[^>]*>[\s\S]*?<\/section>/,
  )?.[0];
  assert.ok(visitFlow, "expected the visit-flow section");

  const visitText = textContent(visitFlow);
  const stageOneTitle = "사진으로 먼저 안내";
  const stageTwoTitle = "약속한 장소에서 함께 확인";
  const safetySummary = "차량을 보내는 거래라면 무엇을 확인해야 하나요?";
  const safetyAnswer = "출발 전에 최종 금액과 감가 기준, 거래 중단 시 반환 조건, 왕복 운임 부담을 확인하세요. 바이크매니저는 약속한 장소로 직접 방문해 현장에서 거래합니다.";

  for (const copy of [
    "사진 확인부터 현장 거래까지",
    "바이크는 그대로 두고, 사진만 보내주세요.",
    "바이크매니저가 약속한 장소로 직접 찾아갑니다.",
    stageOneTitle,
    "기종·연식·주행거리·지역과 사진을 보내주시면 예상 견적과 방문 가능한 시간을 안내합니다.",
    "예상 견적",
    "방문 시간",
    stageTwoTitle,
    "차량과 서류를 함께 확인하고, 최종 금액과 판매대금 전액 입금을 확인한 뒤 상차합니다.",
    "차량 상태",
    "최종 금액",
    "전액 입금",
    "상차",
    "입금 확인",
    "확인 후 상차",
    "사진 보내고 방문 일정 확인",
    safetySummary,
    safetyAnswer,
  ]) {
    assert.ok(visitText.includes(copy), `expected visit journey copy: ${copy}`);
  }

  assert.ok(
    visitText.indexOf(stageOneTitle) < visitText.indexOf(stageTwoTitle),
    "expected photo guidance before onsite dealing in DOM order",
  );
  assert.equal([...visitFlow.matchAll(/class="[^"]*\bvisit-flow__stage(?:\s|")[^"]*"/g)].length, 2);
  assert.match(visitFlow, /class="[^"]*\bvisit-flow__progress\b[^"]*"/);
  assert.doesNotMatch(visitFlow, /transaction-path|direct-visit\.webp|send-first\.webp/u);
  assert.equal([...visitFlow.matchAll(/<details\b/g)].length, 1, "expected one neutral safety disclosure");
  assert.ok(visitFlow.includes(`<summary>${safetySummary}</summary>`));
  assert.match(visitFlow, /data-cta="method-kakao"/);
  assert.match(visitFlow, /href="https:\/\/pf\.kakao\.com\/_MzgSn\/chat"/);
  assert.doesNotMatch(visitFlow, /바이크매니저 직접 방문|차량을 먼저 보내는 방식|두 갈래 거래 경로/u);
  assert.doesNotMatch(html, /data-testid="transaction-paths"/);
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

test("keys compact proof thumbnail image size hints by content layout", async () => {
  const component = await readFile(new URL("../components/CaseStudies.tsx", import.meta.url), "utf8");

  assert.match(component, /featured:\s*"\(max-width: 760px\) 100vw, 420px"/);
  assert.match(component, /portrait:\s*"\(max-width: 760px\) 50vw, 300px"/);
  assert.match(component, /sizes=\{caseImageSizes\[caseStudy\.layout\]\}/);
  assert.doesNotMatch(component, /case-card__overlay/);
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

test("collects marketing terms from visible copy, metadata, ARIA labels, and JSON-LD", () => {
  const fixture = [
    "<title>최고가 안내</title>",
    '<meta property="og:description" content="무조건 확인"/>',
    '<main aria-label="즉시 출동 상담">모든 차량 상담</main>',
    '<script type="application/ld+json">{"description":"100% 확인"}</script>',
    '<p>전 기종 매입</p>',
    '<script>const implementationStyle = "width:100%";</script>',
  ].join("");

  const surface = marketingSurface(fixture);
  for (const term of ["최고가", "무조건", "100%", "즉시 출동", "모든 차량", "전 기종"]) {
    assert.match(surface, new RegExp(term, "u"), `expected the marketing-surface collector to detect ${term}`);
    assert.match(
      marketingSurface(`<main>${term}</main>`),
      prohibitedMarketingTerms,
      `expected the forbidden-marketing scanner to reject ${term} in isolation`,
    );
  }
  assert.doesNotMatch(marketingSurface('<img style="width:100%"/>'), prohibitedMarketingTerms);
});

test("removes fabricated social proof and fake live activity", () => {
  assert.doesNotMatch(html, /후기 89개/);
  assert.doesNotMatch(html, /실시간 구매/);
  assert.doesNotMatch(html, /네이버 인증 업체/);
  assert.doesNotMatch(html, /당근마켓 인증 업체/);
  assert.doesNotMatch(marketingSurface(html), prohibitedMarketingTerms);
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
