import { expect, test, type Locator, type Page } from "@playwright/test";

type Rgb = readonly [number, number, number];

const faqAnswerContracts = [
  {
    question: "사진 견적이 최종 금액인가요?",
    answer:
      "사진 견적은 예상 금액입니다. 현장에서 차량과 서류를 확인하고 달라지는 이유와 최종 금액을 설명한 뒤 판매자가 동의하면 거래합니다.",
    facts: ["사진 견적은 예상 금액", "차량과 서류", "최종 금액", "판매자가", "동의"],
  },
  {
    question: "당일이나 늦은 시간에도 방문할 수 있나요?",
    answer:
      "24시간 편하게 문의하세요. 인천·서울·경기 지역은 당일·야간 방문도 일정에 맞춰 최대한 빠르게 조율해드립니다.",
    facts: ["24시간", "인천·서울·경기", "당일·야간 방문", "일정", "빠르게 조율"],
  },
  {
    question: "번호판이 있거나 폐지 전인 차량도 상담할 수 있나요?",
    answer:
      "가능합니다. 등록 상태와 본인 소유 여부를 먼저 확인하고 필요한 서류와 절차를 알려드립니다.",
    facts: ["등록 상태", "본인 소유", "서류"],
  },
] as const;

function parseCssColor(color: string): Rgb {
  if (color.startsWith("#")) {
    return [1, 3, 5].map((offset) => Number.parseInt(color.slice(offset, offset + 2), 16)) as unknown as Rgb;
  }

  const channels = color.match(/[\d.]+/g)?.slice(0, 3).map(Number);
  expect(channels, `expected an RGB color, received ${color}`).toHaveLength(3);
  return channels as unknown as Rgb;
}

function contrastRatio(left: Rgb, right: Rgb) {
  const luminance = (color: Rgb) => {
    const [red, green, blue] = color.map((channel) => {
      const normalized = channel / 255;
      return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  };
  const [lighter, darker] = [luminance(left), luminance(right)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

async function renderedLines(locator: Locator) {
  return locator.evaluate((element) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const lines: Array<{ text: string; top: number }> = [];

    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = node.textContent ?? "";

      for (let index = 0; index < text.length; index += 1) {
        if (/\s/u.test(text[index])) continue;

        const range = document.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + 1);
        const rect = range.getBoundingClientRect();
        if (!rect.width || !rect.height) continue;

        let line = lines.find((candidate) => Math.abs(candidate.top - rect.top) < 2);
        if (!line) {
          line = { text: "", top: rect.top };
          lines.push(line);
        }
        line.text += text[index];
      }
    }

    return lines.sort((left, right) => left.top - right.top).map((line) => line.text);
  });
}

async function waitForStablePosition(locator: Locator) {
  await locator.evaluate(
    (element) =>
      new Promise<void>((resolve) => {
        let previousTop = element.getBoundingClientRect().top;
        let stableFrames = 0;

        const sample = () => {
          const currentTop = element.getBoundingClientRect().top;
          stableFrames = Math.abs(currentTop - previousTop) < 0.5 ? stableFrames + 1 : 0;
          previousTop = currentTop;

          if (stableFrames >= 8) {
            resolve();
            return;
          }
          requestAnimationFrame(sample);
        };

        requestAnimationFrame(sample);
      }),
  );
}

function visitStageButton(page: Page, name: string) {
  return page.getByTestId("visit-flow").getByRole("button", { name: new RegExp(name) });
}

function visitStage(page: Page, key: "photoGuide" | "onsiteDeal") {
  return page.getByTestId("visit-flow").locator(`.visit-flow__stage--${key}`);
}

async function expectStaticVisitStage(stage: Locator, label: string) {
  const summary = stage.locator(":scope > .visit-flow__stage-summary");
  await expect(summary, `${label}: expected one static stage summary`).toHaveCount(1);
  await expect(summary, `${label}: static summary must be a plain container`).toHaveJSProperty("tagName", "DIV");
  await expect(summary, `${label}: static summary must not advertise expansion`).not.toHaveAttribute("aria-expanded");
  await expect(summary, `${label}: static summary must not control a panel`).not.toHaveAttribute("aria-controls");
}

async function visitStagePanel(button: Locator, page: Page) {
  const panelId = await button.getAttribute("aria-controls");
  if (!panelId) throw new Error("expected each visit stage button to control a detail panel");
  return page.locator(`#${panelId}`);
}

async function expectInactiveVisitStageToBeUnavailable(panel: Locator) {
  const state = await panel.evaluate((element) => {
    const styles = getComputedStyle(element);
    const tabStops = [...element.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )].filter((candidate) => candidate.tabIndex >= 0).length;
    return {
      hidden: element.hasAttribute("hidden") || styles.display === "none" || styles.visibility === "hidden",
      inert: Boolean(element.closest("[inert]")),
      ariaHidden: element.getAttribute("aria-hidden") === "true",
      tabStops,
    };
  });

  expect(
    state.hidden || state.inert || (state.ariaHidden && state.tabStops === 0),
    "an inactive detail must be hidden, inert, or aria-hidden without tab stops",
  ).toBe(true);
}

// Kept only while the skipped legacy contracts remain in this migration file.
function transactionPathButton(page: Page, name: string) {
  return page.getByTestId("transaction-paths").getByRole("button", { name: new RegExp(name) });
}

function transactionPathArticle(page: Page, key: "directVisit" | "sendFirst") {
  return page.getByTestId("transaction-paths").locator(`.transaction-path--${key}`);
}

async function expectStaticTransactionPathSummary(article: Locator, label: string) {
  const summary = article.locator(":scope > .transaction-path__summary");
  await expect(summary, `${label}: expected one static summary`).toHaveCount(1);
  await expect(summary, `${label}: static summary must be a plain container`).toHaveJSProperty("tagName", "DIV");
  await expect(summary, `${label}: static summary must not advertise expansion`).not.toHaveAttribute("aria-expanded");
  await expect(summary, `${label}: static summary must not control a panel`).not.toHaveAttribute("aria-controls");
  await expect(summary, `${label}: static summary must not gain an interactive role`).not.toHaveAttribute("role");
}

async function transactionPathPanel(button: Locator, page: Page) {
  const panelId = await button.getAttribute("aria-controls");
  if (!panelId) throw new Error("expected each transaction path button to control a detail panel");
  return page.locator(`#${panelId}`);
}

async function expectInactiveTransactionPathToBeUnavailable(panel: Locator) {
  await expectInactiveVisitStageToBeUnavailable(panel);
}

async function waitForTransactionLayout(grid: Locator) {
  await waitForVisitFlowLayout(grid);
}

async function countUserVisibleCharacters(root: Locator) {
  return root.evaluate((element) => {
    const isExcluded = (node: Node) => {
      let ancestor = node.parentElement;
      while (ancestor && element.contains(ancestor)) {
        if (ancestor.matches('svg, picture, script, style, noscript, .sr-only, [aria-hidden="true"]')) {
          return true;
        }

        const closedDetails = ancestor.closest("details:not([open])");
        if (closedDetails) {
          const summary = closedDetails.querySelector(":scope > summary");
          if (!summary?.contains(node)) return true;
        }

        const styles = getComputedStyle(ancestor);
        if (styles.display === "none" || styles.visibility === "hidden" || styles.visibility === "collapse") {
          return true;
        }
        if (ancestor === element) break;
        ancestor = ancestor.parentElement;
      }
      return false;
    };

    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let visibleText = "";
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!isExcluded(node)) visibleText += node.textContent ?? "";
    }
    return visibleText.replace(/\s/gu, "").length;
  });
}

async function expectUserVisible(locator: Locator, label: string) {
  const count = await locator.count();
  expect(count, `${label}: expected content in its intended section`).toBeGreaterThan(0);
  const states = await locator.evaluateAll((elements) => elements.map((element) => {
    let excludedBy: string | null = null;
    for (let ancestor: Element | null = element; ancestor; ancestor = ancestor.parentElement) {
      if (ancestor.matches('svg, picture, script, style, noscript, .sr-only, [aria-hidden="true"]')) {
        excludedBy = "semantic-hidden";
        break;
      }
      const closedDetails = ancestor.closest("details:not([open])");
      if (closedDetails) {
        const summary = closedDetails.querySelector(":scope > summary");
        if (!summary?.contains(element)) {
          excludedBy = "closed-details";
          break;
        }
      }
      const styles = getComputedStyle(ancestor);
      if (styles.display === "none" || styles.visibility === "hidden" || styles.visibility === "collapse") {
        excludedBy = `${styles.display}/${styles.visibility}`;
        break;
      }
      if (ancestor === document.documentElement) break;
    }
    const rect = element.getBoundingClientRect();
    return { excludedBy, height: rect.height, width: rect.width };
  }));

  expect(
    states.some(({ excludedBy, height, width }) => excludedBy === null && height > 0 && width > 0),
    `${label}: expected at least one rendered candidate included by the visible-copy model; ${JSON.stringify(states)}`,
  ).toBe(true);
}

async function visibleDetailsContent(details: Locator, label: string) {
  const result = await details.evaluate((element) => {
    if (!(element instanceof HTMLDetailsElement)) throw new Error("expected a native details element");
    const summary = element.querySelector(":scope > summary");
    if (!summary) throw new Error("expected a direct native summary");

    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let content = "";
    let renderedNodes = 0;
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (summary.contains(node)) continue;
      if (!(summary.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING)) continue;

      let excluded = false;
      for (let ancestor = node.parentElement; ancestor; ancestor = ancestor.parentElement) {
        if (ancestor.matches('svg, picture, script, style, noscript, .sr-only, [aria-hidden="true"]')) {
          excluded = true;
          break;
        }
        const closedDetails = ancestor.closest("details:not([open])");
        if (closedDetails) {
          const nestedSummary = closedDetails.querySelector(":scope > summary");
          if (!nestedSummary?.contains(node)) {
            excluded = true;
            break;
          }
        }
        const styles = getComputedStyle(ancestor);
        if (styles.display === "none" || styles.visibility === "hidden" || styles.visibility === "collapse") {
          excluded = true;
          break;
        }
        if (ancestor === element) break;
      }
      if (excluded) continue;

      const range = document.createRange();
      range.selectNodeContents(node);
      const rendered = [...range.getClientRects()].some((rect) => rect.width > 0 && rect.height > 0);
      if (!rendered) continue;
      content += node.textContent ?? "";
      renderedNodes += 1;
    }
    return { content: content.replace(/\s+/gu, " ").trim(), renderedNodes };
  });

  expect(result.renderedNodes, `${label}: expected rendered post-summary detail content`).toBeGreaterThan(0);
  expect(result.content, `${label}: expected non-empty post-summary detail content`).not.toBe("");
  return result.content;
}

async function expectMethodCtaContained(page: Page, label: string, hitTest: boolean) {
  const cta = page.locator('[data-cta="method-kakao"]');
  if (hitTest) {
    await cta.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const nextScrollY = Math.max(0, window.scrollY + rect.bottom - window.innerHeight + 4);
      window.scrollTo(0, nextScrollY);
    });
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
  }

  const geometry = await cta.evaluate((element, shouldHitTest) => {
    const ctaRect = element.getBoundingClientRect();
    const flow = element.closest("[data-testid='visit-flow']");
    if (!flow) throw new Error("expected the visit CTA inside the visit flow");

    let effectiveTop = ctaRect.top;
    let effectiveBottom = ctaRect.bottom;
    const violations: string[] = [];
    for (let ancestor: HTMLElement | null = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
      const styles = getComputedStyle(ancestor);
      const clips = [styles.overflowX, styles.overflowY].some((value) => value !== "visible");
      if (ancestor === flow || clips) {
        const ancestorRect = ancestor.getBoundingClientRect();
        effectiveTop = Math.max(effectiveTop, ancestorRect.top);
        effectiveBottom = Math.min(effectiveBottom, ancestorRect.bottom);
        if (
          ctaRect.left < ancestorRect.left - 0.5
          || ctaRect.right > ancestorRect.right + 0.5
          || ctaRect.top < ancestorRect.top - 0.5
          || ctaRect.bottom > ancestorRect.bottom + 0.5
        ) {
          violations.push(
            `${ancestor.tagName.toLowerCase()}.${ancestor.className || "(no-class)"} `
            + `[${styles.overflowX}/${styles.overflowY}]`,
          );
        }
      }
      if (ancestor === document.documentElement) break;
    }

    const bottomPoint = { x: ctaRect.left + ctaRect.width / 2, y: ctaRect.bottom - 2 };
    const hit = shouldHitTest
      && bottomPoint.x >= 0
      && bottomPoint.x < window.innerWidth
      && bottomPoint.y >= 0
      && bottomPoint.y < window.innerHeight
      ? document.elementFromPoint(bottomPoint.x, bottomPoint.y)
      : null;

    return {
      height: ctaRect.height,
      effectiveHeight: Math.max(0, effectiveBottom - effectiveTop),
      hitTestable: !shouldHitTest || Boolean(hit && element.contains(hit)),
      violations,
    };
  }, hitTest);

  expect.soft(geometry.height, `${label}: the CTA layout box must be at least 44px`).toBeGreaterThanOrEqual(44);
  expect.soft(geometry.effectiveHeight, `${label}: at least 44px of the CTA must remain usable`).toBeGreaterThanOrEqual(44);
  expect.soft(geometry.violations, `${label}: the CTA must fit its article and clipping ancestors`).toEqual([]);
  if (hitTest) expect.soft(geometry.hitTestable, `${label}: the CTA bottom inset must hit the link`).toBe(true);
}

async function waitForVisitFlowLayout(flow: Locator) {
  await flow.evaluate(
    (element) => new Promise<void>((resolve) => {
      let previous = "";
      let stableFrames = 0;
      const sample = () => {
        const tracked = [element, ...element.querySelectorAll(".visit-flow__stage, [data-cta='method-kakao']")];
        const current = tracked.map((item) => {
          const rect = item.getBoundingClientRect();
          return [rect.left, rect.top, rect.width, rect.height].map((value) => value.toFixed(2)).join(":");
        }).join("|");
        stableFrames = current === previous ? stableFrames + 1 : 0;
        previous = current;
        if (stableFrames >= 5) resolve();
        else requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    }),
  );
}

test("hero title keeps its two sentences in separate visual lines", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const desktopLines = await renderedLines(page.locator(".hero h1"));
  expect(desktopLines).toEqual(["바이크는그대로두세요.", "직접찾아가매입합니다."]);

  await page.setViewportSize({ width: 390, height: 844 });
  const mobileLines = await renderedLines(page.locator(".hero h1"));
  expect(mobileLines).toEqual(["바이크는그대로두세요.", "직접찾아가매입합니다."]);
});

test("mobile keeps the hero title larger than section headings and readable", async ({ page }) => {
  const approvedTitleLines = ["바이크는그대로두세요.", "직접찾아가매입합니다."];

  for (const { width, maximumTitleLines } of [
    { width: 320, maximumTitleLines: 2 },
    { width: 390, maximumTitleLines: 1 },
  ]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");

    const [heroFontSize, sectionFontSize, documentWidths] = await Promise.all([
      page.locator(".hero h1").evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize)),
      page.locator("#method-title").evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize)),
      page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth })),
    ]);

    expect(heroFontSize, `${width}px hero title must outrank the representative section heading`).toBeGreaterThan(sectionFontSize);
    expect(documentWidths.document, `${width}px must not overflow horizontally`).toBeLessThanOrEqual(documentWidths.viewport);

    const titleLines = page.locator(".hero__title-line");
    for (const [index, expectedText] of approvedTitleLines.entries()) {
      const visualLines = await renderedLines(titleLines.nth(index));
      expect(visualLines.length).toBeGreaterThan(0);
      expect(visualLines.length).toBeLessThanOrEqual(maximumTitleLines);
      expect(visualLines.every((line) => line.length > 1)).toBe(true);
      expect(visualLines.join("")).toBe(expectedText);
    }
  }
});

test("wide section headings do not gain avoidable extra lines", async ({ page }) => {
  const headingIds = ["method-title", "cases-title", "quote-title", "guide-title", "faq-title", "final-title"];

  await page.setViewportSize({ width: 1200, height: 900 });
  await page.goto("/");
  const mediumLineCounts = new Map<string, number>();
  for (const id of headingIds) {
    mediumLineCounts.set(id, (await renderedLines(page.locator(`#${id}`))).length);
  }

  await page.setViewportSize({ width: 1440, height: 900 });

  for (const id of headingIds) {
    const wideLineCount = (await renderedLines(page.locator(`#${id}`))).length;
    expect(wideLineCount, `${id} should not add lines on a wider viewport`).toBeLessThanOrEqual(
      mediumLineCounts.get(id) ?? 0,
    );
  }
});

test("removes standalone process, comparison, and Naver proof sections", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("process-story")).toHaveCount(0);
  await expect(page.locator(".process-step, #process-title")).toHaveCount(0);
  await expect(page.locator(".honest-section, #honest-title")).toHaveCount(0);
  await expect(page.locator(".naver-proof, #naver-title")).toHaveCount(0);
  await expect(page.locator('#process[data-testid="visit-flow"]')).toHaveCount(1);
});

test("390px visible copy is at least 30% shorter than the documented baseline", async ({ page }) => {
  const maxVisibleCharacters = 1576;
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const visibleCharacters = await countUserVisibleCharacters(page.locator("main"));
  expect(
    visibleCharacters,
    "visible copy must be at least 30% shorter than the documented baseline",
  ).toBeLessThanOrEqual(maxVisibleCharacters);
});

test("390px first view exposes the seller decision facts and contact paths", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const heroText = (await page.locator("#top").innerText()).replace(/\s/gu, "");
  for (const fact of ["인천·서울·경기", "바이크는 그대로", "직접 찾아가 매입합니다"]) {
    expect(heroText, `expected first-view fact: ${fact}`).toContain(fact.replace(/\s/gu, ""));
  }

  const decisionFacts = page.locator("#top .hero__description");
  await expect(decisionFacts).toContainText("현장에서 차량 상태와 최종 금액을 확인하고");
  await expect(decisionFacts).toContainText("판매대금 전액이 입금된 것을 확인한 뒤 상차합니다.");
  const decisionFactsBox = await decisionFacts.boundingBox();
  expect(decisionFactsBox, "the transaction facts need a rendered first-view box").not.toBeNull();
  expect(decisionFactsBox?.y ?? -1, "the transaction facts must start inside the 390px viewport").toBeGreaterThanOrEqual(0);
  expect(
    (decisionFactsBox?.y ?? Number.POSITIVE_INFINITY) + (decisionFactsBox?.height ?? 0),
    "the transaction facts must remain fully readable in the 390px viewport",
  ).toBeLessThanOrEqual(844);

  for (const locator of [
    page.locator('[data-cta="hero-kakao"]'),
    page.locator('[data-cta="header-phone"]'),
  ]) {
    const box = await locator.boundingBox();
    expect(box).not.toBeNull();
    expect(box?.y ?? Number.POSITIVE_INFINITY).toBeLessThan(844);
    expect((box?.y ?? -1) + (box?.height ?? 0)).toBeGreaterThan(0);
  }
});

test("390px visibly renders the approved hero facts and contact links", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const hero = page.locator("#top");

  for (const copy of [
    "인천·서울·경기 중고 바이크 방문 매입",
    "바이크는 그대로 두세요.",
    "직접 찾아가 매입합니다.",
  ]) {
    await expectUserVisible(hero.getByText(copy, { exact: true }), `hero copy: ${copy}`);
  }
  await expectUserVisible(hero.locator('[data-cta="hero-kakao"]'), "hero Kakao link");
  await expectUserVisible(hero.locator('a[href="tel:010-7616-4949"]'), "hero phone link");
});

test("390px visibly renders all four compact trust facts", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const trust = page.locator("#trust");

  for (const fact of ["경력 10년 이상", "24시간 문의 접수", "직접 방문·현장 확인", "입금 확인 후 상차"]) {
    await expectUserVisible(trust.getByText(fact, { exact: true }), `trust fact: ${fact}`);
  }
});

test("390px visibly renders the sequential visit stages and neutral safety advice", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const flow = page.locator('#process[data-testid="visit-flow"]');
  await expect(flow).toHaveCount(1);

  for (const copy of [
    "사진 확인부터 현장 거래까지",
    "바이크는 그대로 두고, 사진만 보내주세요.",
    "바이크매니저가 약속한 장소로 직접 찾아갑니다.",
    "사진으로 먼저 안내",
    "예상 견적",
    "방문 시간",
    "약속한 장소에서 함께 확인",
    "차량 상태",
    "최종 금액",
    "전액 입금",
    "상차",
    "차량을 보내는 거래라면 무엇을 확인해야 하나요?",
  ]) {
    await expectUserVisible(flow.getByText(copy, { exact: true }), `visit flow copy: ${copy}`);
  }
  await expect(flow.getByRole("button", { name: /사진으로 먼저 안내|약속한 장소에서 함께 확인/ })).toHaveCount(0);
  await expectStaticVisitStage(visitStage(page, "photoGuide"), "390px photo guide");
  await expectStaticVisitStage(visitStage(page, "onsiteDeal"), "390px onsite deal");
  await expectUserVisible(flow.locator('[data-cta="method-kakao"]'), "visit Kakao link");
  const safety = flow.locator("details");
  await expect(safety).toHaveCount(1);
  await expect(safety.locator("summary")).toHaveText("차량을 보내는 거래라면 무엇을 확인해야 하나요?");
  await safety.locator("summary").click();
  await expectUserVisible(safety.getByText("출발 전에 최종 금액과 감가 기준, 거래 중단 시 반환 조건, 왕복 운임 부담을 확인하세요. 바이크매니저는 약속한 장소로 직접 방문해 현장에서 거래합니다.", { exact: true }), "neutral safety answer");
});

test("desktop visit flow changes the connected stage detail without moving the CTA or section height", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");

  const flow = page.getByTestId("visit-flow");
  const photoGuide = visitStageButton(page, "사진으로 먼저 안내");
  const onsiteDeal = visitStageButton(page, "약속한 장소에서 함께 확인");
  const photoGuidePanel = await visitStagePanel(photoGuide, page);
  const onsiteDealPanel = await visitStagePanel(onsiteDeal, page);
  const cta = flow.locator('[data-cta="method-kakao"]');

  await expect(photoGuide).toHaveAttribute("aria-expanded", "true");
  await expect(onsiteDeal).toHaveAttribute("aria-expanded", "false");
  await expect(photoGuidePanel).toBeVisible();
  await expectInactiveVisitStageToBeUnavailable(onsiteDealPanel);
  await expect(cta).toBeVisible();
  await expect(cta).toHaveAttribute("href", "https://pf.kakao.com/_MzgSn/chat");

  const heightBefore = (await flow.boundingBox())?.height ?? 0;
  await onsiteDeal.hover();
  await expect(onsiteDeal).toHaveAttribute("aria-expanded", "true");
  await expectInactiveVisitStageToBeUnavailable(photoGuidePanel);
  await expect(onsiteDealPanel).toBeVisible();
  await expect(cta).toBeVisible();
  await waitForVisitFlowLayout(flow);
  expect((await flow.boundingBox())?.height ?? 0).toBeCloseTo(heightBefore, 0);

  await page.mouse.move(0, 0);
  await expect(photoGuide).toHaveAttribute("aria-expanded", "true");
  await onsiteDeal.focus();
  await expect(onsiteDeal).toHaveAttribute("aria-expanded", "true");
  await onsiteDeal.press("Enter");
  await page.locator('[data-cta="header-phone"]').focus();
  await page.mouse.move(0, 0);
  await expect(onsiteDeal).toHaveAttribute("aria-expanded", "true");
  await expectMethodCtaContained(page, "desktop visit-flow CTA", true);
});

test("reduced motion keeps both visit stages static and visible", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const flow = page.getByTestId("visit-flow");
  await expect(flow.getByRole("button", { name: /사진으로 먼저 안내|약속한 장소에서 함께 확인/ })).toHaveCount(0);
  await expectStaticVisitStage(visitStage(page, "photoGuide"), "reduced-motion photo guide");
  await expectStaticVisitStage(visitStage(page, "onsiteDeal"), "reduced-motion onsite deal");
  await expect(visitStage(page, "photoGuide").locator(":scope > .visit-flow__stage-panel")).toBeVisible();
  await expect(visitStage(page, "onsiteDeal").locator(":scope > .visit-flow__stage-panel")).toBeVisible();
});

test("JavaScript-off desktop keeps both visit stages in DOM order", async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  await page.goto("/");
  const flow = page.getByTestId("visit-flow");
  await expect(flow.getByRole("button", { name: /사진으로 먼저 안내|약속한 장소에서 함께 확인/ })).toHaveCount(0);
  await expectStaticVisitStage(visitStage(page, "photoGuide"), "JavaScript-off photo guide");
  await expectStaticVisitStage(visitStage(page, "onsiteDeal"), "JavaScript-off onsite deal");
  await expect(flow.getByText("사진으로 먼저 안내", { exact: true })).toBeVisible();
  await expect(flow.getByText("약속한 장소에서 함께 확인", { exact: true })).toBeVisible();
  await context.close();
});

test("390px visibly renders cases and the moved official destinations", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const cases = page.locator("#cases");

  for (const copy of [
    "말보다 실제 매입 기록으로 보여드립니다.",
    "당시 차량 사진과 거래 내용은 원문에서 확인하세요.",
    "ADV350",
    "PCX125",
    "아이언883",
  ]) {
    await expectUserVisible(cases.getByText(copy, { exact: true }), `case copy: ${copy}`);
  }

  const blog = cases.getByRole("link", { name: "공식 블로그에서 더 많은 사례 보기", exact: true });
  const place = cases.getByRole("link", { name: "네이버 플레이스·리뷰 보기", exact: true });
  await expectUserVisible(blog, "CaseStudies official blog index link");
  await expect(blog).toHaveAttribute("href", "https://m.blog.naver.com/bikemanager4949");
  await expect(blog).toHaveAttribute("data-cta", "naver-proof");
  await expectUserVisible(place, "CaseStudies Naver Place link");
  await expect(place).toHaveAttribute("href", "https://naver.me/F1rPbAcV");
});

test("390px visibly renders the quote checklist facts", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const quote = page.getByTestId("quote-checklist");

  for (const copy of [
    "사진 몇 장과 기본 정보만 보내주세요.",
    "밝은 곳에서 차량 전체와 하자 부위를 가까이 찍어주세요.",
    "기종",
    "연식",
    "주행거리",
    "하자 내역",
    "폐지 여부",
    "검사 여부",
    "지역",
    "바이크 사진",
  ]) {
    await expectUserVisible(quote.getByText(copy, { exact: true }), `quote copy: ${copy}`);
  }
});

test("390px opens the separate purchase guide disclosure and renders its facts", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const guide = page.locator('section[aria-labelledby="guide-title"]');

  for (const copy of [
    "스쿠터부터 대형 바이크까지 매입 상담합니다.",
    "차량 상태와 등록 정보를 먼저 확인하고 매입 가능 여부와 필요한 서류를 알려드립니다.",
  ]) {
    await expectUserVisible(guide.getByText(copy, { exact: true }), `guide copy: ${copy}`);
  }

  const details = guide.locator("details");
  await expect(details).toHaveCount(1);
  const summary = details.locator(":scope > summary");
  await expect(summary).toHaveText("명의·서류가 다른 경우");
  await expectUserVisible(summary, "purchase guide summary");
  await summary.click();
  await expect(details).toHaveAttribute("open", "");
  await expectUserVisible(details, "opened purchase guide disclosure");
  const answerText = await visibleDetailsContent(details, "purchase guide answer");
  for (const fact of ["신분증", "사용신고필증", "폐지증명서", "타인·법인·외국인 명의", "미성년자", "서류 분실", "차대번호", "추가 확인"]) {
    expect(answerText, `purchase guide answer fact: ${fact}`).toContain(fact);
  }
});

for (const { question, answer: expectedAnswer, facts } of faqAnswerContracts) {
  test(`390px opens the FAQ and renders its core facts in at most two sentences: ${question}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const faq = page.locator("#faq");
    const details = faq.locator("details").filter({ has: page.locator("summary", { hasText: question }) });
    await expect(details).toHaveCount(1);
    const summary = details.locator(":scope > summary");
    await expect(summary).toHaveText(question);
    await expectUserVisible(summary, `FAQ summary: ${question}`);
    await summary.click();
    await expect(details).toHaveAttribute("open", "");
    await expectUserVisible(details, `opened FAQ disclosure: ${question}`);
    const answerText = await visibleDetailsContent(details, `FAQ answer: ${question}`);
    expect(answerText, `canonical FAQ answer: ${question}`).toBe(expectedAnswer);
    for (const fact of facts) expect(answerText, `FAQ answer fact: ${fact}`).toContain(fact);

    const terminators = answerText.match(/[.!?。！？]/gu) ?? [];
    const sentences = answerText.split(/[.!?。！？]+/u).map((sentence) => sentence.trim()).filter(Boolean);
    expect(sentences.length, `FAQ answer must be non-empty: ${question}`).toBeGreaterThanOrEqual(1);
    expect(terminators.length, `FAQ answer terminator budget: ${question}`).toBeLessThanOrEqual(2);
    expect(sentences.length, `FAQ answer sentence budget: ${question}`).toBeLessThanOrEqual(2);
  });
}

test("390px visibly renders the final location facts and links", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const location = page.locator("#contact");

  for (const copy of ["예상 견적부터 방문 일정까지 빠르게 안내합니다.", "24시간 문의 접수 · 방문 전 연락"]) {
    await expectUserVisible(location.getByText(copy, { exact: true }), `location copy: ${copy}`);
  }
  const map = location.getByRole("link", { name: "네이버 지도에서 위치·리뷰 보기", exact: true });
  await expectUserVisible(map, "final Naver map/review link");
  await expect(map).toHaveAttribute("href", "https://naver.me/F1rPbAcV");
  await expectUserVisible(location.locator('[data-cta="final-phone"]'), "final phone link");
  await expectUserVisible(location.getByRole("link", { name: "카카오톡으로 사진 보내기", exact: true }), "final Kakao link");
});

test.skip("legacy desktop transaction paths preview, pin, and prioritize keyboard focus", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 500 });
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, 0));

  const paths = page.getByTestId("transaction-paths");
  const directVisit = transactionPathButton(page, "바이크매니저 직접 방문");
  const sendFirst = transactionPathButton(page, "차량을 먼저 보내는 방식");
  const pathsLine = paths.getByTestId("transaction-path-lines");

  await expect(paths).toBeAttached();
  expect(
    await paths.evaluate((element) => {
      const { bottom, top } = element.getBoundingClientRect();
      return top >= window.innerHeight || bottom <= 0;
    }),
    "the path section must begin out of view before its first reveal assertion",
  ).toBe(true);
  await expect(directVisit).toHaveAttribute("aria-expanded", "true");
  await expect(sendFirst).toHaveAttribute("aria-expanded", "false");
  await expect(pathsLine).toHaveAttribute("aria-hidden", "true");
  await expect(pathsLine).toHaveAttribute("data-revealed", "false");
  const directVisitPanel = await transactionPathPanel(directVisit, page);
  const sendFirstPanel = await transactionPathPanel(sendFirst, page);
  const methodCta = directVisitPanel.locator('[data-cta="method-kakao"]');
  await expect(directVisitPanel).toBeVisible();
  await expectInactiveTransactionPathToBeUnavailable(sendFirstPanel);
  await expect(methodCta).toHaveAttribute("href", "https://pf.kakao.com/_MzgSn/chat");
  await directVisit.focus();
  await page.keyboard.press("Tab");
  await expect(methodCta).toBeFocused();
  expect((await methodCta.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
  await page.locator('[data-cta="header-phone"]').focus();

  const heightBeforePreview = (await paths.boundingBox())?.height;
  await sendFirst.hover();
  await expect(sendFirst).toHaveAttribute("aria-expanded", "true");
  await expect(directVisit).toHaveAttribute("aria-expanded", "false");
  await expect(sendFirstPanel).toBeVisible();
  await expectInactiveTransactionPathToBeUnavailable(directVisitPanel);
  expect((await paths.boundingBox())?.height).toBeCloseTo(heightBeforePreview ?? 0, 0);

  await page.mouse.move(0, 0);
  await expect(directVisit).toHaveAttribute("aria-expanded", "true");
  await expect(sendFirst).toHaveAttribute("aria-expanded", "false");
  await expect(directVisitPanel).toBeVisible();
  await expectInactiveTransactionPathToBeUnavailable(sendFirstPanel);

  await sendFirst.click();
  await page.mouse.move(0, 0);
  await expect(sendFirst).toHaveAttribute("aria-expanded", "true");
  await expect(sendFirstPanel).toBeVisible();
  await expectInactiveTransactionPathToBeUnavailable(directVisitPanel);

  await sendFirst.focus();
  await directVisit.hover();
  await expect(sendFirst).toHaveAttribute("aria-expanded", "true");
  await expect(directVisit).toHaveAttribute("aria-expanded", "false");

  await directVisit.focus();
  await directVisit.press("Space");
  await expect(directVisit).toHaveAttribute("aria-expanded", "true");
  await page.locator('[data-cta="header-phone"]').focus();
  await page.mouse.move(0, 0);
  await expect(directVisit).toHaveAttribute("aria-expanded", "true");

  await sendFirst.focus();
  await sendFirst.press("Enter");
  await expect(sendFirst).toHaveAttribute("aria-expanded", "true");
  await page.locator('[data-cta="header-phone"]').focus();
  await page.mouse.move(0, 0);
  await expect(sendFirst).toHaveAttribute("aria-expanded", "true");

  await paths.scrollIntoViewIfNeeded();
  await expect(pathsLine).toHaveAttribute("data-revealed", "true");
  await page.locator(".hero").scrollIntoViewIfNeeded();
  await expect(pathsLine).toHaveAttribute("data-revealed", "true");
});

for (const width of [960, 1440]) {
  test.skip(`${width}px legacy transaction states keep the CTA contained and the next section clear`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");

    const paths = page.getByTestId("transaction-paths");
    const grid = paths.locator(".transaction-paths__grid");
    const directVisit = transactionPathButton(page, "바이크매니저 직접 방문");
    const sendFirst = transactionPathButton(page, "차량을 먼저 보내는 방식");
    await expect(grid).toHaveAttribute("data-enhanced", "true");
    await waitForTransactionLayout(grid);
    const baselineHeight = (await grid.boundingBox())?.height ?? 0;
    const directArticle = grid.locator(".transaction-path--directVisit");
    const sendFirstArticle = grid.locator(".transaction-path--sendFirst");
    const articleWidths = async () => ({
      direct: (await directArticle.boundingBox())?.width ?? 0,
      sendFirst: (await sendFirstArticle.boundingBox())?.width ?? 0,
    });
    const initialWidths = await articleWidths();
    if (width === 960) {
      expect(Math.abs(initialWidths.direct - initialWidths.sendFirst), "960px paths stay equal width").toBeLessThanOrEqual(1);
    } else {
      expect(initialWidths.direct / initialWidths.sendFirst, "1440px direct path receives 1.12/.88 emphasis")
        .toBeCloseTo(1.12 / 0.88, 1);
    }
    const expectStableHeight = async (label: string) => {
      await waitForTransactionLayout(grid);
      const height = (await grid.boundingBox())?.height ?? 0;
      expect.soft(Math.abs(height - baselineHeight), `${width}px ${label} grid height delta`).toBeLessThanOrEqual(1);
    };

    await expectMethodCtaContained(page, `${width}px direct active`, true);

    await sendFirst.hover();
    await expect(sendFirst).toHaveAttribute("aria-expanded", "true");
    await waitForTransactionLayout(grid);
    const hoverWidths = await articleWidths();
    if (width === 960) {
      expect(Math.abs(hoverWidths.direct - hoverWidths.sendFirst), "960px hover stays equal width").toBeLessThanOrEqual(1);
    } else {
      expect(hoverWidths.sendFirst / hoverWidths.direct, "1440px send-first hover reverses 1.12/.88 emphasis")
        .toBeCloseTo(1.12 / 0.88, 1);
    }
    await expectMethodCtaContained(page, `${width}px send-first hover active`, false);
    await expectStableHeight("hover");

    await page.mouse.move(0, 0);
    await expect(directVisit).toHaveAttribute("aria-expanded", "true");
    await expectStableHeight("hover reset");

    await sendFirst.click();
    await page.mouse.move(0, 0);
    await expect(sendFirst).toHaveAttribute("aria-expanded", "true");
    await waitForTransactionLayout(grid);
    await expectMethodCtaContained(page, `${width}px send-first click active`, false);
    await expectStableHeight("click");

    await directVisit.focus();
    await directVisit.press("Space");
    await page.locator('[data-cta="header-phone"]').focus();
    await page.mouse.move(0, 0);
    await expect(directVisit).toHaveAttribute("aria-expanded", "true");
    await waitForTransactionLayout(grid);
    await expectMethodCtaContained(page, `${width}px direct Space active`, true);
    await expectStableHeight("Space");

    await sendFirst.focus();
    await sendFirst.press("Enter");
    await page.locator('[data-cta="header-phone"]').focus();
    await page.mouse.move(0, 0);
    await expect(sendFirst).toHaveAttribute("aria-expanded", "true");
    await waitForTransactionLayout(grid);
    await expectMethodCtaContained(page, `${width}px send-first Enter active`, false);
    await expectStableHeight("Enter");

    const nextSection = await paths.evaluate((element) => {
      const next = element.nextElementSibling;
      if (!next) return null;
      return {
        id: next.id,
        pathsBottom: element.getBoundingClientRect().bottom,
        nextTop: next.getBoundingClientRect().top,
      };
    });
    expect.soft(nextSection, `${width}px transaction section must have a following section`).not.toBeNull();
    expect.soft(nextSection?.pathsBottom ?? 0, `${width}px transaction section must not overlap its successor`)
      .toBeLessThanOrEqual((nextSection?.nextTop ?? 0) + 1);
    expect.soft(nextSection?.id).toBe("cases");
  });
}

test.skip("legacy 200% text at 960px keeps the transaction CTA contained without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 960, height: 900 });
  await page.goto("/");
  const grid = page.getByTestId("transaction-paths").locator(".transaction-paths__grid");
  await expect(grid).toHaveAttribute("data-enhanced", "true");
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  await waitForTransactionLayout(grid);

  await expectMethodCtaContained(page, "960px at 200% text", true);
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});

test.skip("legacy transaction paths switch between interactive and static semantics when motion preference changes", async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 500 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, 0));

  const paths = page.getByTestId("transaction-paths");
  const pathsLine = paths.getByTestId("transaction-path-lines");
  let directVisit = transactionPathButton(page, "바이크매니저 직접 방문");
  let sendFirst = transactionPathButton(page, "차량을 먼저 보내는 방식");
  const directVisitArticle = transactionPathArticle(page, "directVisit");
  const sendFirstArticle = transactionPathArticle(page, "sendFirst");
  const directVisitPanel = directVisitArticle.locator(":scope > .transaction-path__panel");
  const sendFirstPanel = sendFirstArticle.locator(":scope > .transaction-path__panel");

  await expect(directVisit).toHaveAttribute("aria-expanded", "true");
  await expect(sendFirst).toHaveAttribute("aria-expanded", "false");
  await expect(pathsLine).toHaveAttribute("data-revealed", "false");
  await expect(directVisitPanel).toBeVisible();
  await expectInactiveTransactionPathToBeUnavailable(sendFirstPanel);

  await page.emulateMedia({ reducedMotion: "reduce" });

  await expect(paths.getByRole("button", { name: /바이크매니저 직접 방문|차량을 먼저 보내는 방식/ })).toHaveCount(0);
  await expectStaticTransactionPathSummary(directVisitArticle, "reduced-motion direct visit");
  await expectStaticTransactionPathSummary(sendFirstArticle, "reduced-motion send first");
  await expect(directVisitPanel).toBeVisible();
  await expect(sendFirstPanel).toBeVisible();
  await expect(pathsLine).toHaveAttribute("data-revealed", "true");

  await page.emulateMedia({ reducedMotion: "no-preference" });
  directVisit = transactionPathButton(page, "바이크매니저 직접 방문");
  sendFirst = transactionPathButton(page, "차량을 먼저 보내는 방식");
  await expect(directVisit).toHaveAttribute("aria-expanded", "true");
  await expect(sendFirst).toHaveAttribute("aria-expanded", "false");
  await sendFirst.hover();
  await expect(sendFirst).toHaveAttribute("aria-expanded", "true");
  await expect(directVisit).toHaveAttribute("aria-expanded", "false");
  expect(runtimeErrors, "live media-query semantic switches must not log hydration/runtime errors").toEqual([]);
});

test.skip("legacy transaction paths clear a focused transient path across live mode changes", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");

  let directVisit = transactionPathButton(page, "바이크매니저 직접 방문");
  let sendFirst = transactionPathButton(page, "차량을 먼저 보내는 방식");
  await sendFirst.focus();
  await expect(sendFirst).toHaveAttribute("aria-expanded", "true");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.getByTestId("transaction-paths").getByRole("button")).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });

  directVisit = transactionPathButton(page, "바이크매니저 직접 방문");
  sendFirst = transactionPathButton(page, "차량을 먼저 보내는 방식");
  await expect(directVisit, "a stale focused path must not override the pinned direct-visit path").toHaveAttribute("aria-expanded", "true");
  await expect(sendFirst).toHaveAttribute("aria-expanded", "false");

  await sendFirst.hover();
  await expect(sendFirst).toHaveAttribute("aria-expanded", "true");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.mouse.move(0, 0);
  await page.emulateMedia({ reducedMotion: "no-preference" });

  directVisit = transactionPathButton(page, "바이크매니저 직접 방문");
  sendFirst = transactionPathButton(page, "차량을 먼저 보내는 방식");
  await expect(directVisit, "a stale preview path must not override the pinned direct-visit path").toHaveAttribute("aria-expanded", "true");
  await expect(sendFirst).toHaveAttribute("aria-expanded", "false");
});

test("case studies use the featured and portrait layout at each breakpoint", async ({ page }) => {
  const cards = (model: string) =>
    page.locator("article.case-card", { has: page.getByRole("heading", { name: model, exact: true }) });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const [wideAdv, widePcx, wideIron] = await Promise.all([cards("ADV350").boundingBox(), cards("PCX125").boundingBox(), cards("아이언883").boundingBox()]);
  expect(wideAdv && widePcx && wideIron).toBeTruthy();
  if (!wideAdv || !widePcx || !wideIron) return;
  expect(Math.abs(wideAdv.y - widePcx.y)).toBeLessThan(2);
  expect(Math.abs(widePcx.y - wideIron.y)).toBeLessThan(2);
  expect(wideAdv.width).toBeGreaterThan(widePcx.width * 1.7);
  expect(Math.abs(widePcx.width - wideIron.width)).toBeLessThan(3);

  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto("/");
  const [tabletAdv, tabletPcx, tabletIron] = await Promise.all([cards("ADV350").boundingBox(), cards("PCX125").boundingBox(), cards("아이언883").boundingBox()]);
  expect(tabletAdv && tabletPcx && tabletIron).toBeTruthy();
  if (!tabletAdv || !tabletPcx || !tabletIron) return;
  expect(tabletAdv.x).toBeLessThan(tabletPcx.x);
  expect(Math.abs(tabletPcx.x - tabletIron.x)).toBeLessThan(2);
  expect(Math.abs(tabletAdv.y - tabletPcx.y)).toBeLessThan(16);
  expect(tabletIron.y).toBeGreaterThan(tabletPcx.y + tabletPcx.height - 2);
  expect(tabletAdv.height).toBeGreaterThan(tabletPcx.height * 1.7);
  expect(Math.abs(tabletAdv.y + tabletAdv.height - (tabletIron.y + tabletIron.height))).toBeLessThan(16);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const [mobileAdv, mobilePcx, mobileIron] = await Promise.all([cards("ADV350").boundingBox(), cards("PCX125").boundingBox(), cards("아이언883").boundingBox()]);
  expect(mobileAdv && mobilePcx && mobileIron).toBeTruthy();
  if (!mobileAdv || !mobilePcx || !mobileIron) return;
  expect(Math.abs(mobileAdv.x - mobilePcx.x)).toBeLessThan(2);
  expect(Math.abs(mobilePcx.x - mobileIron.x)).toBeLessThan(2);
  expect(mobilePcx.y).toBeGreaterThan(mobileAdv.y + mobileAdv.height - 2);
  expect(mobileIron.y).toBeGreaterThan(mobilePcx.y + mobilePcx.height - 2);
});

test("downstream hash targets remain visible below the fixed header after settling", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  for (const id of ["process", "faq", "contact"]) {
    await page.goto(`/#${id}`, { waitUntil: "networkidle" });
    const target = page.locator(`#${id}`);
    if (id === "process") {
      await expect(target).toHaveAttribute("data-testid", "visit-flow");
      await expect(target.locator("#method-title")).toHaveText("바이크는 그대로 두고, 사진만 보내주세요.");
    }
    await waitForStablePosition(target);
    const top = await target.evaluate((element) => element.getBoundingClientRect().top);
    expect(top, `#${id} should clear the fixed header`).toBeGreaterThanOrEqual(72);
    expect(top, `#${id} should settle inside the viewport`).toBeLessThan(900);
  }
});

test("focus indicator maintains 3:1 contrast on the approved light and dark surfaces", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const target = page.locator('[data-cta="header-phone"]');
  await target.focus();
  const styles = await target.evaluate((element) => {
    const targetStyles = getComputedStyle(element);
    const rootStyles = getComputedStyle(document.documentElement);
    return {
      focusVisible: element.matches(":focus-visible"),
      outlineColor: targetStyles.outlineColor,
      outlineWidth: Number.parseFloat(targetStyles.outlineWidth),
      shadowColors: targetStyles.boxShadow.match(/rgba?\([^)]+\)/g) ?? [],
      surfaces: [rootStyles.getPropertyValue("--paper").trim(), rootStyles.getPropertyValue("--ink").trim()],
    };
  });

  expect(styles.focusVisible).toBe(true);
  expect(styles.outlineWidth).toBeGreaterThanOrEqual(2);
  const indicatorColors = [styles.outlineColor, ...styles.shadowColors].map(parseCssColor);
  for (const surface of styles.surfaces.map(parseCssColor)) {
    expect(Math.max(...indicatorColors.map((color) => contrastRatio(color, surface)))).toBeGreaterThanOrEqual(3);
  }
});

test("case cards load distinct local images", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const images = page.locator(".case-card__media img");
  await expect(images).toHaveCount(3);
  const imageStates = await images.evaluateAll((elements) =>
    elements.map((element) => {
      const image = element as HTMLImageElement;
      return { src: image.src, complete: image.complete, naturalWidth: image.naturalWidth };
    }),
  );

  expect(new Set(imageStates.map(({ src }) => src)).size).toBe(3);
  for (const { complete, naturalWidth } of imageStates) {
    expect(complete).toBe(true);
    expect(naturalWidth).toBeGreaterThan(0);
  }
});

test("mobile inquiry bar appears after the hero and hides at the final call to action", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const bar = page.getByTestId("sticky-inquiry");
  await expect(bar).not.toHaveClass(/is-visible/);

  await page.getByTestId("quote-checklist").scrollIntoViewIfNeeded();
  await expect(bar).toHaveClass(/is-visible/);

  await page.getByTestId("final-cta").scrollIntoViewIfNeeded();
  await expect(bar).not.toHaveClass(/is-visible/);
});

test("sticky inquiry becomes inert and returns focus to visible process and contact destinations", async ({ page }) => {
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion });
    await page.goto("/");

    const bar = page.getByTestId("sticky-inquiry");
    const stickyKakao = bar.locator('[data-cta="sticky-kakao"]');
    await page.getByTestId("quote-checklist").scrollIntoViewIfNeeded();
    await expect(bar, `${reducedMotion}: sticky inquiry should become visible before each transition`).toHaveClass(/is-visible/);

    await stickyKakao.focus();
    await page.locator("#process").scrollIntoViewIfNeeded();
    await expect(bar, `${reducedMotion}: process transition must make the bar inert`).toHaveAttribute("inert", "");
    await expect(bar).toHaveAttribute("aria-hidden", "true");
    await expect(page.locator("#process"), `${reducedMotion}: process is the logical visible focus destination`).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(stickyKakao, `${reducedMotion}: the old hidden link must not regain focus through Enter`).not.toBeFocused();
    await page.locator('[data-cta="header-phone"]').focus();
    await expect(page.locator("#process"), `${reducedMotion}: the temporary process tabindex must be cleaned up after focus leaves`).not.toHaveAttribute("tabindex");
    await expect(stickyKakao.click({ timeout: 500 }), `${reducedMotion}: the old hidden link must reject pointer activation`).rejects.toThrow();

    await page.getByTestId("quote-checklist").scrollIntoViewIfNeeded();
    await expect(bar, `${reducedMotion}: sticky inquiry should reappear away from the process`).toHaveClass(/is-visible/);
    await stickyKakao.focus();
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await expect(bar, `${reducedMotion}: contact transition must make the bar inert`).toHaveAttribute("inert", "");
    await expect(bar).toHaveAttribute("aria-hidden", "true");
    await expect(page.locator("#contact"), `${reducedMotion}: contact is the logical visible focus destination`).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(stickyKakao, `${reducedMotion}: the old hidden link must not regain focus through Enter`).not.toBeFocused();
    await page.locator('[data-cta="header-phone"]').focus();
    await expect(page.locator("#contact"), `${reducedMotion}: the temporary contact tabindex must be cleaned up after focus leaves`).not.toHaveAttribute("tabindex");
    await expect(stickyKakao.click({ timeout: 500 }), `${reducedMotion}: the old hidden link must reject pointer activation`).rejects.toThrow();
  }
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test.skip("legacy reduced-motion transaction path semantics", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    await expect(page.getByTestId("process-story")).toHaveCount(0);
    await expect(page.getByTestId("hero-copy")).toHaveCSS("animation-name", "none");
    await expect(page.getByTestId("hero-media")).toHaveCSS("animation-name", "none");

    const paths = page.getByTestId("transaction-paths");
    const directVisitArticle = transactionPathArticle(page, "directVisit");
    const sendFirstArticle = transactionPathArticle(page, "sendFirst");
    const directVisitPanel = directVisitArticle.locator(":scope > .transaction-path__panel");
    const sendFirstPanel = sendFirstArticle.locator(":scope > .transaction-path__panel");
    await expect(paths.getByRole("button", { name: /바이크매니저 직접 방문|차량을 먼저 보내는 방식/ })).toHaveCount(0);
    await expectStaticTransactionPathSummary(directVisitArticle, "reduced-motion direct visit");
    await expectStaticTransactionPathSummary(sendFirstArticle, "reduced-motion send first");
    await expect(directVisitPanel).toBeVisible();
    await expect(sendFirstPanel).toBeVisible();
    await expect(paths.locator('[data-cta="method-kakao"]')).toBeVisible();
    await expect(paths.getByTestId("transaction-path-lines")).toHaveAttribute("data-revealed", "true");
  });

  test.skip("legacy mobile inquiry bar hidden over transaction paths", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollTo(0, 845));

    const sticky = page.getByTestId("sticky-inquiry");
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(845);
    await expect(sticky).toHaveAttribute("aria-hidden", "true");
    await expect(sticky).not.toHaveClass(/is-visible/);
  });
});

test.skip("legacy JavaScript-off desktop keeps both transaction paths visible", async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  await page.goto("/");
  await expect(page.getByTestId("process-story")).toHaveCount(0);

  const paths = page.getByTestId("transaction-paths");
  const directVisitArticle = transactionPathArticle(page, "directVisit");
  const sendFirstArticle = transactionPathArticle(page, "sendFirst");
  const directVisitPanel = directVisitArticle.locator(":scope > .transaction-path__panel");
  const sendFirstPanel = sendFirstArticle.locator(":scope > .transaction-path__panel");
  await expect(paths.getByRole("button", { name: /바이크매니저 직접 방문|차량을 먼저 보내는 방식/ })).toHaveCount(0);
  await expectStaticTransactionPathSummary(directVisitArticle, "JavaScript-off direct visit");
  await expectStaticTransactionPathSummary(sendFirstArticle, "JavaScript-off send first");
  await expect(directVisitPanel).toBeVisible();
  await expect(sendFirstPanel).toBeVisible();
  await expect(paths.locator('[data-cta="method-kakao"]')).toBeVisible();
  await expect(paths.getByTestId("transaction-path-lines")).toHaveAttribute("data-revealed", "true");
  await expect(page.getByTestId("sticky-inquiry")).toHaveAttribute("aria-hidden", "true");

  await context.close();
});

test("small-screen brand lockup keeps its Korean name and accessible home name", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/");

  await expect(page.getByRole("link", { name: /바이크매니저 홈/ })).toBeVisible();
  await expect(page.locator(".brand-mark__name")).toHaveText("바이크매니저");
  await expect(page.locator(".brand-mark__name")).toBeVisible();
});

test("390px secondary navigation links expose at least 44px touch targets", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const targets = [
    { label: "header brand home", locator: page.locator(".brand-mark") },
    { label: "final map and review", locator: page.locator(".final-location > a") },
    { label: "final phone number", locator: page.locator(".final-copy__phone") },
  ];

  for (const { label, locator } of targets) {
    const box = await locator.boundingBox();
    expect.soft(box, `${label} must have a layout box`).not.toBeNull();
    expect.soft(box?.width ?? 0, `${label} must be at least 44px wide`).toBeGreaterThanOrEqual(44);
    expect.soft(box?.height ?? 0, `${label} must be at least 44px tall`).toBeGreaterThanOrEqual(44);
  }
});

test("trust anchor clears the fixed desktop header", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.locator(".hero__scroll").click();

  await expect
    .poll(() => page.locator("#trust").evaluate((element) => element.getBoundingClientRect().top))
    .toBeGreaterThanOrEqual(72);
});

test("loads without console, page, or hydration errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  expect(errors).toEqual([]);
});

for (const viewport of [
  { width: 320, height: 700 },
  { width: 390, height: 844 },
  { width: 768, height: 900 },
  { width: 960, height: 900 },
  { width: 1440, height: 900 },
]) {
  test(`${viewport.width}px has no horizontal overflow or undersized primary actions`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);

    for (const cta of ["hero-kakao", "header-phone", "final-phone"]) {
      const target = page.locator(`[data-cta="${cta}"]`).first();
      const box = await target.boundingBox();
      expect(box, `${cta} should have a box`).not.toBeNull();
      expect(box?.height ?? 0, `${cta} should be at least 44px tall`).toBeGreaterThanOrEqual(44);
    }

    if (viewport.width <= 760) {
      await page.getByTestId("quote-checklist").scrollIntoViewIfNeeded();
      const sticky = page.getByTestId("sticky-inquiry");
      await expect(sticky).toHaveClass(/is-visible/);
      const stickyLinks = sticky.locator("a");
      for (let index = 0; index < (await stickyLinks.count()); index += 1) {
        const box = await stickyLinks.nth(index).boundingBox();
        expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
      }
    }
  });
}
