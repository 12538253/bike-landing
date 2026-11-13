import { expect, test } from "@playwright/test";

for (const { path, title } of [
  { path: "/about", title: "바이크매니저 소개" },
  { path: "/visit-purchase", title: "중고 오토바이 방문 매입 안내" },
]) {
  test(`${path} is reachable from home with JavaScript disabled`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
    try {
      const page = await context.newPage();
      await page.goto("/");
      await page.locator(`footer a[href="${path}"]`).click();
      await expect(page).toHaveURL(new RegExp(`${path}$`));
      await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
      const response = await page.reload();
      expect(response?.status()).toBe(200);
      expect(response?.headers()["x-robots-tag"]).toContain("noindex");
      await page.getByRole("navigation", { name: "주요 메뉴" }).getByRole("link", { name: "진행 방법" }).click();
      await expect(page).toHaveURL(/\/#process$/);
      await expect(page.locator("#process")).toBeVisible();
    } finally {
      await context.close();
    }
  });

  for (const width of [320, 390, 768, 1440]) {
    test(`${path} stays readable and keeps working contact links at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      const contact = page.locator(".information-contact");
      for (const href of ["tel:010-7616-4949", "https://pf.kakao.com/_MzgSn/chat"]) {
        const link = contact.locator(`a[href="${href}"]`);
        await link.scrollIntoViewIfNeeded();
        await expect(link).toBeVisible();
        const box = await link.boundingBox();
        expect(box?.height).toBeGreaterThanOrEqual(44);
      }
    });
  }
}
