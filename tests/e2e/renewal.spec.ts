import { expect, test } from "@playwright/test";

test("desktop process story follows the active scroll step", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const story = page.getByTestId("process-story");
  await story.scrollIntoViewIfNeeded();
  await expect(story).toHaveAttribute("data-enhanced", "true");

  const thirdStep = page.getByTestId("process-step-2");
  await thirdStep.scrollIntoViewIfNeeded();
  await expect(story).toHaveAttribute("data-active-step", "2");
  await expect(page.getByTestId("process-stage-label")).toContainText("현장 검수");
});

test("mobile keeps every process step visible without scroll enhancement", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const story = page.getByTestId("process-story");
  await story.scrollIntoViewIfNeeded();
  await expect(story).toHaveAttribute("data-enhanced", "false");

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

    await expect(page.getByTestId("process-story")).toHaveAttribute("data-enhanced", "false");
    await expect(page.locator(".process-stage")).toBeHidden();
    await expect(page.getByTestId("process-step-3")).toBeVisible();
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
  await expect(page.getByTestId("process-story")).toHaveAttribute("data-enhanced", "false");
  await expect(page.locator(".process-stage")).toBeHidden();
  for (let index = 0; index < 4; index += 1) {
    await expect(page.getByTestId(`process-step-${index}`)).toBeVisible();
  }

  await context.close();
});

test("small-screen brand link keeps an accessible home name", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/");

  await expect(page.getByRole("link", { name: /바이크매니저 홈/ })).toBeVisible();
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
