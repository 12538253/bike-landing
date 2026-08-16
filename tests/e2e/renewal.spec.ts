import { expect, test, type Locator, type Page } from "@playwright/test";

type Rgb = readonly [number, number, number];

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

async function expectExpandedTextToRemainReachableAtTextZoom(locator: Locator, label: string) {
  await locator.scrollIntoViewIfNeeded();
  const result = await locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const clippingAncestors: string[] = [];

    for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
      const styles = getComputedStyle(ancestor);
      const clipsVertically = [styles.overflow, styles.overflowY].some((value) => value === "hidden" || value === "clip" || value === "scroll" || value === "auto");
      if (clipsVertically && ancestor.scrollHeight > ancestor.clientHeight + 1) clippingAncestors.push(ancestor.className || ancestor.tagName);
    }

    const fixedOverlays = [...document.querySelectorAll<HTMLElement>("body *")]
      .filter((candidate) => candidate !== element && !candidate.contains(element))
      .filter((candidate) => {
        const styles = getComputedStyle(candidate);
        if (styles.position !== "fixed" || styles.visibility === "hidden" || styles.display === "none" || Number(styles.opacity) === 0) return false;
        const overlay = candidate.getBoundingClientRect();
        return overlay.width > 0 && overlay.height > 0
          && overlay.left < rect.right && overlay.right > rect.left && overlay.top < rect.bottom && overlay.bottom > rect.top;
      })
      .map((candidate) => candidate.dataset.testid || candidate.className || candidate.tagName);

    return { clippingAncestors, fixedOverlays };
  });

  expect(result.clippingAncestors, `${label}: expanded text must not be vertically clipped`).toEqual([]);
  expect(result.fixedOverlays, `${label}: expanded text must not sit under fixed UI`).toEqual([]);
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
  const headingIds = ["method-title", "cases-title", "quote-title", "faq-title", "final-title"];

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
  await expect(decisionFacts).toContainText("약속한 장소에서 차량과 최종 금액을 함께 확인하고");
  await expect(decisionFacts).toContainText("판매대금 전액 입금 후 상차합니다.");
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

  for (const fact of ["24시간 문의 접수", "인천·서울·경기 직접 방문", "스쿠터부터 대형 바이크까지", "공식 블로그 실제 사례"]) {
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
    "공식 블로그에 남긴 실제 매입 기록입니다.",
    "늦은 저녁 자택 방문 · 현장 확인 후 대금 지급",
    "공식 블로그 매입 기록",
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
    "밝은 곳에서 차량 전체와 확인이 필요한 부위를 가까이 찍어주세요.",
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

test("390px opens the merged support document disclosure and renders its facts", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const guide = page.locator("#faq");

  for (const copy of [
    "스쿠터부터 대형 바이크까지 상담합니다.",
    "차량 상태와 등록 정보를 확인해 진행 가능 여부와 필요한 서류를 안내합니다.",
  ]) {
    await expectUserVisible(guide.getByText(copy, { exact: true }), `guide copy: ${copy}`);
  }

  const details = guide.locator("details").filter({ hasText: "명의·서류가 다른 경우" });
  await expect(guide.locator("details")).toHaveCount(4);
  const summary = details.locator(":scope > summary");
  await expect(summary).toHaveText("명의·서류가 다른 경우");
  await expectUserVisible(summary, "purchase guide summary");
  await summary.click();
  await expect(details).toHaveAttribute("open", "");
  await expectUserVisible(details, "opened purchase guide disclosure");
  const answerText = await visibleDetailsContent(details, "purchase guide answer");
  for (const fact of ["신분증", "사용신고필증", "폐지증명서", "타인·법인·외국인 명의", "미성년자", "서류 분실", "차대번호", "현재 상태", "필요한 확인 사항과 서류"]) {
    expect(answerText, `purchase guide answer fact: ${fact}`).toContain(fact);
  }
});

test("200% text zoom keeps representative VisitFlow and support detail text reachable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));

  const visitDescription = page.locator(".visit-flow__stage--photoGuide .visit-flow__stage-panel > p");
  await expectUserVisible(visitDescription, "200% text zoom VisitFlow description");
  await expectExpandedTextToRemainReachableAtTextZoom(visitDescription, "200% text zoom VisitFlow description");

  const guide = page.locator("#faq details").filter({ hasText: "명의·서류가 다른 경우" });
  await guide.locator(":scope > summary").click();
  const supportAnswer = guide.locator(".support-answer > p");
  await expectUserVisible(supportAnswer, "200% text zoom expanded support answer");
  await expectExpandedTextToRemainReachableAtTextZoom(supportAnswer, "200% text zoom expanded support answer");
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

test("390px renders final contact actions before location facts and links", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const location = page.locator("#contact");

  for (const copy of ["예상 견적부터 방문 일정까지 빠르게 안내합니다.", "24시간 문의 접수 · 방문 전 연락"]) {
    await expectUserVisible(location.getByText(copy, { exact: true }), `location copy: ${copy}`);
  }
  const map = location.getByRole("link", { name: "네이버 지도에서 위치·리뷰 보기", exact: true });
  await expectUserVisible(map, "final Naver map/review link");
  await expect(map).toHaveAttribute("href", "https://naver.me/F1rPbAcV");
  const finalKakao = location.getByRole("link", { name: "사진 보내고 예상 견적 확인", exact: true });
  const finalPhone = location.locator('[data-cta="final-phone"]');
  await expectUserVisible(finalPhone, "final phone link");
  await expectUserVisible(finalKakao, "final Kakao link");
  const [kakaoBox, phoneBox, mapBox] = await Promise.all([finalKakao.boundingBox(), finalPhone.boundingBox(), map.boundingBox()]);
  expect(kakaoBox && phoneBox && mapBox).toBeTruthy();
  if (!kakaoBox || !phoneBox || !mapBox) return;
  expect(kakaoBox.y).toBeLessThan(mapBox.y);
  expect(phoneBox.y).toBeLessThan(mapBox.y);
});

test("case studies keep one featured proof and a readable compact pair at 320px", async ({ page }) => {
  const cards = (model: string) =>
    page.locator("article.case-card", { has: page.getByRole("heading", { name: model, exact: true }) });

  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("/");
  const [mobileAdv, mobilePcx, mobileIron] = await Promise.all([cards("ADV350").boundingBox(), cards("PCX125").boundingBox(), cards("아이언883").boundingBox()]);
  expect(mobileAdv && mobilePcx && mobileIron).toBeTruthy();
  if (!mobileAdv || !mobilePcx || !mobileIron) return;
  expect(mobileAdv.width).toBeGreaterThan(mobilePcx.width * 1.8);
  expect(Math.abs(mobilePcx.y - mobileIron.y)).toBeLessThan(2);
  expect(mobileIron.x).toBeGreaterThan(mobilePcx.x + mobilePcx.width - 2);
  expect(mobilePcx.y).toBeGreaterThan(mobileAdv.y + mobileAdv.height - 2);
  expect(mobilePcx.width).toBeGreaterThanOrEqual(130);
});

test("compact case source links keep a 44px unclipped touch target at every supported width", async ({ page }) => {
  const cards = page.locator("article.case-card");

  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");

    for (let index = 0; index < await cards.count(); index += 1) {
      const card = cards.nth(index);
      const sourceLink = card.locator("a.case-card__link");
      const [cardBox, linkBox] = await Promise.all([card.boundingBox(), sourceLink.boundingBox()]);
      expect(cardBox && linkBox, `${width}px card ${index + 1} must render`).toBeTruthy();
      if (!cardBox || !linkBox) continue;
      expect(linkBox.height, `${width}px card ${index + 1} source link height`).toBeGreaterThanOrEqual(44);
      expect(linkBox.x, `${width}px card ${index + 1} source link left edge`).toBeGreaterThanOrEqual(cardBox.x - 1);
      expect(linkBox.y, `${width}px card ${index + 1} source link top edge`).toBeGreaterThanOrEqual(cardBox.y - 1);
      expect(linkBox.x + linkBox.width, `${width}px card ${index + 1} source link right edge`).toBeLessThanOrEqual(cardBox.x + cardBox.width + 1);
      expect(linkBox.y + linkBox.height, `${width}px card ${index + 1} source link bottom edge`).toBeLessThanOrEqual(cardBox.y + cardBox.height + 1);
    }
  }
});

test("compact case proof and source links remain readable and unclipped", async ({ page }) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");

    for (const card of await page.locator("article.case-card").all()) {
      const proof = card.locator(".case-card__proof");
      const link = card.locator(".case-card__link");
      await expectUserVisible(proof, `${width}px compact proof`);
      await expectUserVisible(link, `${width}px compact source link`);
      const [cardBox, proofBox, linkBox, proofFontSize, linkFontSize] = await Promise.all([
        card.boundingBox(),
        proof.boundingBox(),
        link.boundingBox(),
        proof.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize)),
        link.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize)),
      ]);
      expect(cardBox && proofBox && linkBox).toBeTruthy();
      if (!cardBox || !proofBox || !linkBox) continue;
      expect(proofFontSize, `${width}px proof must remain readable`).toBeGreaterThanOrEqual(11);
      expect(linkFontSize, `${width}px source link must remain readable`).toBeGreaterThanOrEqual(11);
      for (const [label, box] of [["proof", proofBox], ["link", linkBox]] as const) {
        expect(box.x, `${width}px ${label} left edge`).toBeGreaterThanOrEqual(cardBox.x - 1);
        expect(box.x + box.width, `${width}px ${label} right edge`).toBeLessThanOrEqual(cardBox.x + cardBox.width + 1);
      }
    }
  }
});

test("200% text zoom preserves readable intrinsic layout without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });

  const dimensions = await page.evaluate(() => ({ clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  for (const target of [page.locator('[data-cta="hero-kakao"]'), page.locator('[data-cta="final-phone"]')]) {
    const box = await target.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  }
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

  await page.evaluate(() => window.scrollTo(0, document.querySelector<HTMLElement>("#cases")!.offsetTop + 225));
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
    await page.evaluate(() => window.scrollTo(0, document.querySelector<HTMLElement>("#cases")!.offsetTop + 225));
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

    await page.evaluate(() => window.scrollTo(0, document.querySelector<HTMLElement>("#cases")!.offsetTop + 225));
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

test("sticky inquiry yields to the labelled FAQ section and restores its temporary tabindex", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const bar = page.getByTestId("sticky-inquiry");
  const stickyKakao = bar.locator('[data-cta="sticky-kakao"]');
  const faq = page.locator("#faq");
  await page.evaluate(() => window.scrollTo(0, document.querySelector<HTMLElement>("#cases")!.offsetTop + 225));
  await expect(bar).toHaveClass(/is-visible/);

  await stickyKakao.focus();
  await faq.scrollIntoViewIfNeeded();
  await expect(bar).toHaveAttribute("inert", "");
  await expect(bar).toHaveAttribute("aria-hidden", "true");
  await expect(faq).toBeFocused();
  await page.locator('[data-cta="header-phone"]').focus();
  await expect(faq).not.toHaveAttribute("tabindex");
});

test("case-action overlap moves focus out of sticky inquiry before making it inert", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const bar = page.getByTestId("sticky-inquiry");
  const stickyKakao = bar.locator('[data-cta="sticky-kakao"]');
  const cases = page.locator("#cases");
  await page.evaluate(() => window.scrollTo(0, document.querySelector<HTMLElement>("#cases")!.offsetTop + 225));
  await expect(bar).toHaveClass(/is-visible/);

  await stickyKakao.focus();
  await page.evaluate(() => window.scrollTo(0, document.querySelector<HTMLElement>("#cases")!.offsetTop + 25));
  await expect(bar).toHaveAttribute("inert", "");
  await expect(bar).toHaveAttribute("aria-hidden", "true");
  await expect(cases).toBeFocused();
  await page.locator('[data-cta="header-phone"]').focus();
  await expect(cases).not.toHaveAttribute("tabindex");
  await expect(stickyKakao).not.toBeFocused();
});

test("761px through 960px header preserves navigation without exposing the Kakao header action early", async ({ page }) => {
  for (const width of [761, 768, 960, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");

    const nav = page.getByRole("navigation", { name: "주요 메뉴" });
    const header = page.locator(".site-header__inner");
    await expect(nav, `${width}px navigation must be visible from the 761px breakpoint`).toBeVisible();
    const [headerBox, navBox, dimensions] = await Promise.all([
      header.boundingBox(),
      nav.boundingBox(),
      page.evaluate(() => ({ clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth })),
    ]);
    expect(headerBox && navBox, `${width}px header and navigation must render`).toBeTruthy();
    if (!headerBox || !navBox) continue;
    expect(navBox.x).toBeGreaterThanOrEqual(headerBox.x - 1);
    expect(navBox.x + navBox.width).toBeLessThanOrEqual(headerBox.x + headerBox.width + 1);
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);

    const kakao = page.locator(".header-kakao");
    if (width < 960) await expect(kakao).toBeHidden();
    else await expect(kakao).toBeVisible();

    const regions = [
      { label: "brand", locator: page.locator(".brand-mark") },
      { label: "navigation", locator: nav },
      { label: "header actions", locator: page.locator(".site-header__actions") },
    ];
    const regionBoxes = await Promise.all(regions.map(async ({ label, locator }) => ({ label, box: await locator.boundingBox() })));
    for (const { label, box } of regionBoxes) expect(box, `${width}px ${label} must have a box`).not.toBeNull();
    for (let index = 1; index < regionBoxes.length; index += 1) {
      const previous = regionBoxes[index - 1].box;
      const current = regionBoxes[index].box;
      if (!previous || !current) continue;
      expect(previous.x + previous.width, `${width}px ${regionBoxes[index - 1].label} must precede ${regionBoxes[index].label}`).toBeLessThanOrEqual(current.x + 1);
      expect(previous.y + previous.height, `${width}px ${regionBoxes[index - 1].label} must vertically overlap ${regionBoxes[index].label}`).toBeGreaterThan(current.y);
      expect(current.y + current.height, `${width}px ${regionBoxes[index].label} must vertically overlap ${regionBoxes[index - 1].label}`).toBeGreaterThan(previous.y);
    }

    for (const link of await nav.getByRole("link").all()) {
      const box = await link.boundingBox();
      expect(box, `${width}px navigation link must have a box`).not.toBeNull();
      expect(box?.width ?? 0, `${width}px navigation link must be at least 44px wide`).toBeGreaterThanOrEqual(44);
      expect(box?.height ?? 0, `${width}px navigation link must be at least 44px tall`).toBeGreaterThanOrEqual(44);
    }
  }
});

test("footer small type remains 13–14px with readable contrast", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const footer = page.locator(".site-footer");
  await expect(footer).toContainText("문의 010-7616-4949");
  const metrics = await footer.locator("small").evaluate((element) => {
    const styles = getComputedStyle(element);
    const footerStyles = getComputedStyle(element.closest(".site-footer")!);
    return { fontSize: Number.parseFloat(styles.fontSize), color: styles.color, background: footerStyles.backgroundColor };
  });
  expect(metrics.fontSize).toBeGreaterThanOrEqual(13);
  expect(metrics.fontSize).toBeLessThanOrEqual(14);
  expect(contrastRatio(parseCssColor(metrics.color), parseCssColor(metrics.background))).toBeGreaterThanOrEqual(3);
});

test("focus indicator is a 2–3px high-contrast ring on light and dark controls", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  for (const target of [page.locator('[data-cta="header-phone"]'), page.locator('[data-cta="final-phone"]')]) {
    await target.focus();
    const styles = await target.evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        focusVisible: element.matches(":focus-visible"),
        outlineColor: computed.outlineColor,
        outlineWidth: Number.parseFloat(computed.outlineWidth),
        boxShadow: computed.boxShadow,
      };
    });
    expect(styles.focusVisible).toBe(true);
    expect(styles.outlineWidth).toBeGreaterThanOrEqual(2);
    expect(styles.outlineWidth).toBeLessThanOrEqual(3);
    expect(styles.boxShadow).toMatch(/0px 0px 0px (?:2|3)px/);
  }
});

test("390px default main and visit flow remain intrinsically compact", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const [mainBox, flowBox] = await Promise.all([page.locator("main").boundingBox(), page.getByTestId("visit-flow").boundingBox()]);
  expect(mainBox?.height ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(5400);
  expect(flowBox?.height ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(985);
});

test("wide coarse-pointer visit flow remains a static two-stage fallback", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  await page.goto("/");

  const flow = page.getByTestId("visit-flow");
  await expect(flow.getByRole("button", { name: /사진으로 먼저 안내|약속한 장소에서 함께 확인/ })).toHaveCount(0);
  await expectStaticVisitStage(visitStage(page, "photoGuide"), "coarse photo guide");
  await expectStaticVisitStage(visitStage(page, "onsiteDeal"), "coarse onsite deal");
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

test("fixed header and mobile sticky inquiry leave every visible action hit-testable", async ({ page }) => {
  for (const viewport of [
    { width: 320, height: 700 },
    { width: 390, height: 844 },
    { width: 768, height: 900 },
    { width: 960, height: 900 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const defaultHits = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('a[href], button, summary')]
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const styles = getComputedStyle(element);
        const inViewport = rect.width > 0 && rect.height > 0
          && rect.left >= 0 && rect.right <= innerWidth && rect.top >= 0 && rect.bottom <= innerHeight;
        const hit = inViewport ? document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2) : null;
        return { name: element.textContent?.trim(), inViewport, visible: styles.visibility !== "hidden" && styles.display !== "none", hit: Boolean(hit && element.contains(hit)) };
      })
      .filter((candidate) => candidate.visible && candidate.inViewport && !candidate.hit));
    expect(defaultHits, `${viewport.width}px fixed header must not cover a visible action`).toEqual([]);

    if (viewport.width > 760) continue;
    await page.evaluate(() => window.scrollTo(0, document.querySelector<HTMLElement>("#cases")!.offsetTop + 500));
    const sticky = page.getByTestId("sticky-inquiry");
    await expect(sticky).toHaveClass(/is-visible/);
    const safeStickyHits = await sticky.locator("a").evaluateAll((elements) => elements.map((element) => {
      const rect = element.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return Boolean(hit && element.contains(hit));
    }));
    expect(safeStickyHits, `${viewport.width}px sticky actions must receive their center hit-tests`).toEqual([true, true]);

    await page.locator("#cases").scrollIntoViewIfNeeded();
    await expect(sticky).not.toHaveClass(/is-visible/);
    const overlap = await page.evaluate(() => {
      const sticky = document.querySelector<HTMLElement>("[data-testid='sticky-inquiry']");
      if (!sticky) return { hidden: true, covered: [] as string[] };
      const stickyRect = sticky.getBoundingClientRect();
      const covered = [...document.querySelectorAll<HTMLElement>('a[href], button, summary')]
        .filter((element) => !sticky.contains(element))
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          const styles = getComputedStyle(element);
          return styles.visibility !== "hidden" && styles.display !== "none" && rect.width > 0 && rect.height > 0
            && rect.right > stickyRect.left && rect.left < stickyRect.right && rect.bottom > stickyRect.top && rect.top < stickyRect.bottom;
        })
        .map((element) => element.textContent?.trim() ?? "unnamed action");
      return { hidden: false, covered };
    });
    expect(overlap.hidden).toBe(false);
    expect(overlap.covered, `${viewport.width}px sticky inquiry must not cover a visible action`).toEqual([]);
  }
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
      await page.evaluate(() => window.scrollTo(0, document.querySelector<HTMLElement>("#cases")!.offsetTop + 500));
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
