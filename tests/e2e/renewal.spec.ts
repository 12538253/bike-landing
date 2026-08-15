import { expect, test, type Locator, type Page } from "@playwright/test";

type Rgb = readonly [number, number, number];

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

function transactionPathButton(page: Page, name: string) {
  return page.getByTestId("transaction-paths").getByRole("button", { name: new RegExp(name) });
}

async function transactionPathPanel(button: Locator, page: Page) {
  const panelId = await button.getAttribute("aria-controls");
  if (!panelId) throw new Error("expected each transaction path button to control a detail panel");
  return page.locator(`#${panelId}`);
}

async function expectInactiveTransactionPathToBeUnavailable(panel: Locator) {
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
    const article = element.closest("article");
    if (!article) throw new Error("expected the transaction CTA inside an article");

    let effectiveTop = ctaRect.top;
    let effectiveBottom = ctaRect.bottom;
    const violations: string[] = [];
    for (let ancestor: HTMLElement | null = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
      const styles = getComputedStyle(ancestor);
      const clips = [styles.overflowX, styles.overflowY].some((value) => value !== "visible");
      if (ancestor === article || clips) {
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

async function waitForTransactionLayout(grid: Locator) {
  await grid.evaluate(
    (element) => new Promise<void>((resolve) => {
      let previous = "";
      let stableFrames = 0;
      const sample = () => {
        const tracked = [element, ...element.querySelectorAll("article, [data-cta='method-kakao']")];
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
  expect(desktopLines.some((line) => line.includes("됩니다.직접"))).toBe(false);
  expect(desktopLines.length).toBeLessThanOrEqual(3);

  await page.setViewportSize({ width: 390, height: 844 });
  const mobileLines = await renderedLines(page.locator(".hero h1"));
  expect(mobileLines.some((line) => line.includes("됩니다.직접"))).toBe(false);
  expect(mobileLines.length).toBeLessThanOrEqual(4);
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
  await expect(page.locator('#process[data-testid="transaction-paths"]')).toHaveCount(1);
});

test("390px visible copy stays within the approved 30–40% reduction band", async ({ page }) => {
  const documentedBaseline = 2249;
  const methodologyTolerance = 2;
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const visibleCharacters = await countUserVisibleCharacters(page.locator("main"));
  expect(
    visibleCharacters,
    "visible copy must retain at least 60% of the documented baseline",
  ).toBeGreaterThanOrEqual(Math.ceil(documentedBaseline * 0.6) - methodologyTolerance);
  expect(
    visibleCharacters,
    "visible copy must be at least 30% shorter than the documented baseline",
  ).toBeLessThanOrEqual(Math.floor(documentedBaseline * 0.7) + methodologyTolerance);
});

test("390px first view exposes the seller decision facts and contact paths", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const heroText = (await page.locator("#top").innerText()).replace(/\s/gu, "");
  for (const fact of ["인천·서울·경기", "직접", "사진", "현장", "최종금액", "입금확인후상차"]) {
    expect(heroText, `expected first-view fact: ${fact}`).toContain(fact.replace(/\s/gu, ""));
  }

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

test("desktop transaction paths preview, pin, and prioritize keyboard focus", async ({ page }) => {
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
  test(`${width}px transaction states keep the CTA contained and the next section clear`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");

    const paths = page.getByTestId("transaction-paths");
    const grid = paths.locator(".transaction-paths__grid");
    const directVisit = transactionPathButton(page, "바이크매니저 직접 방문");
    const sendFirst = transactionPathButton(page, "차량을 먼저 보내는 방식");
    await expect(grid).toHaveAttribute("data-enhanced", "true");
    await waitForTransactionLayout(grid);
    const baselineHeight = (await grid.boundingBox())?.height ?? 0;
    const expectStableHeight = async (label: string) => {
      await waitForTransactionLayout(grid);
      const height = (await grid.boundingBox())?.height ?? 0;
      expect.soft(Math.abs(height - baselineHeight), `${width}px ${label} grid height delta`).toBeLessThanOrEqual(1);
    };

    await expectMethodCtaContained(page, `${width}px direct active`, true);

    await sendFirst.hover();
    await expect(sendFirst).toHaveAttribute("aria-expanded", "true");
    await waitForTransactionLayout(grid);
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

test("200% text at 960px keeps the transaction CTA contained without horizontal overflow", async ({ page }) => {
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

test("transaction paths restore the completed static fallback when motion preference changes", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 500 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, 0));

  const paths = page.getByTestId("transaction-paths");
  const pathsLine = paths.getByTestId("transaction-path-lines");
  const directVisit = transactionPathButton(page, "바이크매니저 직접 방문");
  const sendFirst = transactionPathButton(page, "차량을 먼저 보내는 방식");
  const directVisitPanel = await transactionPathPanel(directVisit, page);
  const sendFirstPanel = await transactionPathPanel(sendFirst, page);

  await expect(pathsLine).toHaveAttribute("data-revealed", "false");
  await expect(directVisitPanel).toBeVisible();
  await expectInactiveTransactionPathToBeUnavailable(sendFirstPanel);

  await page.emulateMedia({ reducedMotion: "reduce" });

  await expect(directVisit).toHaveAttribute("aria-expanded", "true");
  await expect(sendFirst).toHaveAttribute("aria-expanded", "true");
  await expect(directVisitPanel).toBeVisible();
  await expect(sendFirstPanel).toBeVisible();
  await expect(pathsLine).toHaveAttribute("data-revealed", "true");
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
      await expect(target).toHaveAttribute("data-testid", "transaction-paths");
      await expect(target.locator("#method-title")).toHaveText("차량은 곁에 두고, 거래 조건은 현장에서 확인하세요.");
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

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("disables entrance and scroll-linked animation", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    await expect(page.getByTestId("process-story")).toHaveCount(0);
    await expect(page.getByTestId("hero-copy")).toHaveCSS("animation-name", "none");
    await expect(page.getByTestId("hero-media")).toHaveCSS("animation-name", "none");

    const paths = page.getByTestId("transaction-paths");
    const directVisitPanel = await transactionPathPanel(transactionPathButton(page, "바이크매니저 직접 방문"), page);
    const sendFirstPanel = await transactionPathPanel(transactionPathButton(page, "차량을 먼저 보내는 방식"), page);
    await expect(directVisitPanel).toBeVisible();
    await expect(sendFirstPanel).toBeVisible();
    await expect(paths.getByTestId("transaction-path-lines")).toHaveAttribute("data-revealed", "true");
  });
});

test("JavaScript-off desktop keeps both transaction paths visible", async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  await page.goto("/");
  await expect(page.getByTestId("process-story")).toHaveCount(0);

  const paths = page.getByTestId("transaction-paths");
  const directVisitPanel = await transactionPathPanel(transactionPathButton(page, "바이크매니저 직접 방문"), page);
  const sendFirstPanel = await transactionPathPanel(transactionPathButton(page, "차량을 먼저 보내는 방식"), page);
  await expect(directVisitPanel).toBeVisible();
  await expect(sendFirstPanel).toBeVisible();
  await expect(paths.getByTestId("transaction-path-lines")).toHaveAttribute("data-revealed", "true");

  await context.close();
});

test("small-screen brand lockup keeps its Korean name and accessible home name", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/");

  await expect(page.getByRole("link", { name: /바이크매니저 홈/ })).toBeVisible();
  await expect(page.locator(".brand-mark__name")).toHaveText("바이크매니저");
  await expect(page.locator(".brand-mark__name")).toBeVisible();
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
