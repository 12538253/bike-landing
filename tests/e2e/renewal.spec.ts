import { expect, test, type Locator } from "@playwright/test";

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
  const headingIds = ["quote-title", "method-title", "process-title", "honest-title", "guide-title", "naver-title"];

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

test("process renders a compact 4/2/1 static rail", async ({ page }) => {
  for (const { width, columns } of [
    { width: 1440, columns: 4 },
    { width: 768, columns: 2 },
    { width: 390, columns: 1 },
  ]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");

    const story = page.getByTestId("process-story");
    await expect(story).not.toHaveAttribute("data-enhanced", /.+/);
    await expect(page.locator(".process-stage")).toHaveCount(0);
    const steps = story.locator(".process-step");
    await expect(steps).toHaveCount(4);
    const boxes = await steps.evaluateAll((elements) =>
      elements.map((element) => {
        const { x, y, height } = element.getBoundingClientRect();
        return { x, y, height };
      }),
    );

    expect(new Set(boxes.map(({ x }) => Math.round(x))).size).toBe(columns);
    if (columns === 4) {
      expect((await story.boundingBox())?.height ?? Number.POSITIVE_INFINITY).toBeLessThan(900);
    }
  }
});

test("downstream hash targets remain visible below the fixed header after settling", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  for (const id of ["faq", "contact"]) {
    await page.goto(`/#${id}`, { waitUntil: "networkidle" });
    const target = page.locator(`#${id}`);
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

test("mobile keeps every process step visible without scroll enhancement", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const story = page.getByTestId("process-story");
  await story.scrollIntoViewIfNeeded();
  await expect(story).not.toHaveAttribute("data-enhanced", /.+/);
  await expect(page.locator(".process-stage")).toHaveCount(0);

  for (let index = 0; index < 4; index += 1) {
    await expect(page.getByTestId(`process-step-${index}`)).toBeVisible();
  }

  const firstStep = await page.getByTestId("process-step-0").boundingBox();
  const secondStep = await page.getByTestId("process-step-1").boundingBox();
  expect(firstStep).not.toBeNull();
  expect(secondStep).not.toBeNull();
  expect(Math.abs((firstStep?.x ?? 0) - (secondStep?.x ?? 0))).toBeLessThan(2);
  expect(secondStep?.y ?? 0).toBeGreaterThan((firstStep?.y ?? 0) + (firstStep?.height ?? 0));
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

    const story = page.getByTestId("process-story");
    await expect(story).not.toHaveAttribute("data-enhanced", /.+/);
    await expect(page.locator(".process-stage")).toHaveCount(0);
    for (let index = 0; index < 4; index += 1) {
      await expect(page.getByTestId(`process-step-${index}`)).toBeVisible();
    }
    await expect(page.getByTestId("hero-copy")).toHaveCSS("animation-name", "none");
    await expect(page.getByTestId("hero-media")).toHaveCSS("animation-name", "none");
  });
});

test("JavaScript-off desktop falls back to four static process cards", async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  await page.goto("/");
  await expect(page.getByTestId("process-story")).not.toHaveAttribute("data-enhanced", /.+/);
  await expect(page.locator(".process-stage")).toHaveCount(0);
  for (let index = 0; index < 4; index += 1) {
    await expect(page.getByTestId(`process-step-${index}`)).toBeVisible();
  }

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
