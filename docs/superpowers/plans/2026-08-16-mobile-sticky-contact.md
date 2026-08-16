# Mobile Sticky Contact Bar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the mobile phone/Kakao contact bar available from the moment the hero actions leave the viewport until the final CTA appears, while yielding only to controls it would physically cover and using an unmodified official KakaoTalk mark.

**Architecture:** `StickyInquiryBar` remains the only client-side state owner. It observes the hero action group and final CTA, measures actual overlap with main-content controls on scroll/resize/detail toggle, and derives one `visible` state. Contact copy stays in `content/site.ts`; a local official PNG is rendered through `next/image`; CSS owns the petrol/yellow split.

**Tech Stack:** Next.js 16 static export, React 19, TypeScript, CSS, IntersectionObserver, Playwright, Node test runner, Sharp.

## Global Constraints

- Work only on `codex/trust-first-renewal`; do not change `main`, production, DNS, or analytics.
- The sticky bar is mobile-only at `760px` and below.
- Hide while the hero actions are visible and when the final CTA is visible.
- Keep the bar visible through ordinary process, case, quote, and FAQ reading; hide only when a main-content `a`, `button`, `summary`, or expanded support answer physically overlaps the fixed bar.
- Preserve `aria-hidden`, `inert`, safe focus transfer, safe-area inset, and a minimum 58px target height.
- Kakao copy is exactly `사진 보내기`; the Kakao half is `#FEE500` with black text.
- Store the unmodified official Kakao PNG locally; do not hotlink, recolor, crop, stretch, or combine it with the BM mark.
- Do not add the Kakao SDK, external API calls, analytics, or dependencies.

---

### Task 1: Define the persistent mobile behavior and brand contract

**Files:**
- Modify: `tests/e2e/renewal.spec.ts`
- Modify: `tests/static-export.test.mjs`

**Interfaces:**
- Consumes: existing `data-testid="sticky-inquiry"`, `data-testid="hero"`, `data-testid="final-cta"`, `data-cta="sticky-kakao"`.
- Produces: a browser contract for hero-action visibility, content collision, final-CTA hiding, focus transfer, Kakao color/label/asset, and a static asset integrity contract.

- [ ] **Step 1: Write the failing static asset and markup test**

Add a test that reads the exported HTML and requires:

```js
assert.match(html, /data-cta="sticky-kakao"[^>]*>[\s\S]*\/images\/kakao-talk-mark\.png/);
assert.match(html, /data-cta="sticky-kakao"[^>]*>[\s\S]*사진 보내기/);
```

Read `public/images/kakao-talk-mark.png` and assert literal properties independently of production code:

```js
assert.equal(createHash("sha256").update(bytes).digest("hex"), "fe005f9ca27ae6795c8875bd82492f6de5483538d4c2003a1afd606d021edf2a");
const metadata = await sharp(bytes).metadata();
assert.deepEqual({ width: metadata.width, height: metadata.height, format: metadata.format }, {
  width: 68,
  height: 69,
  format: "png",
});
```

- [ ] **Step 2: Replace the old section-wide sticky expectations with real viewport behavior**

Write focused Playwright assertions at `390×844`:

```ts
await expect(bar).not.toHaveClass(/is-visible/); // hero actions visible
await heroActions.evaluate((element) => window.scrollBy(0, element.getBoundingClientRect().bottom + 24));
await expect(bar).toHaveClass(/is-visible/); // process content is allowed
await faq.scrollIntoViewIfNeeded();
await page.evaluate(() => window.scrollBy(0, -180));
await expect(bar).toHaveClass(/is-visible/); // FAQ section alone no longer suppresses it
```

Move one real case link or FAQ summary into the fixed bar rectangle and require `inert`, `aria-hidden="true"`, and safe focus transfer. Move it away and require the bar to return. Keep the final CTA hiding assertion.

Require the rendered Kakao link to expose `사진 보내기`, load `/images/kakao-talk-mark.png`, compute `rgb(254, 229, 0)`, and retain at least 58px height.

- [ ] **Step 3: Run the tests and verify RED**

Run:

```bash
npm run build
npm run test:static
npx playwright test tests/e2e/renewal.spec.ts --grep "mobile inquiry|sticky inquiry|Kakao contact"
```

Expected: static failure because the official asset and new label are absent; browser failure because process/FAQ still suppress the bar and the Kakao half is copper with a Lucide icon.

- [ ] **Step 4: Commit the RED contract**

```bash
git add tests/static-export.test.mjs tests/e2e/renewal.spec.ts
git commit -m "test: require persistent mobile contact bar"
```

---

### Task 2: Implement the persistent bar and official Kakao mark

**Files:**
- Create: `public/images/kakao-talk-mark.png`
- Modify: `components/Hero.tsx`
- Modify: `components/StickyInquiryBar.tsx`
- Modify: `content/site.ts`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `site.contact.stickyKakao`, the real main-content controls, and browser viewport geometry.
- Produces: `data-testid="hero-actions"`, local `/images/kakao-talk-mark.png`, and a derived mobile sticky `visible` state.

- [ ] **Step 1: Add the exact official asset**

Download the Kakao-provided PNG from the official resource endpoint and verify before copying:

```bash
curl -L https://developers.kakao.com/tool/resource/static/img/button/kakaotalksharing/kakaotalk_sharing_btn_medium.png -o /private/tmp/kakao-talk-mark.png
shasum -a 256 /private/tmp/kakao-talk-mark.png
```

Expected SHA-256: `fe005f9ca27ae6795c8875bd82492f6de5483538d4c2003a1afd606d021edf2a`. Copy it byte-for-byte to `public/images/kakao-talk-mark.png` without image processing.

- [ ] **Step 2: Expose the hero action boundary and update contact copy**

Add `data-testid="hero-actions"` to `.hero__actions`. Change only `site.contact.stickyKakao.label` to `사진 보내기`; keep its existing URL and `sticky-kakao` ID.

- [ ] **Step 3: Replace section-wide suppression with actual overlap state**

In `StickyInquiryBar`:

```ts
const [heroActionsVisible, setHeroActionsVisible] = useState(true);
const [contentActionOverlaps, setContentActionOverlaps] = useState(false);
const [finalVisible, setFinalVisible] = useState(false);
```

Observe `[data-testid='hero-actions']` and `[data-testid='final-cta']`. Collect real `main a[href], main button, main summary` controls and expanded support answers while excluding hero/final controls. On scroll, resize, and captured `toggle`, compare each obstacle rectangle with the fixed bar rectangle. When a collision begins and focus is inside the bar, move focus to the colliding obstacle's closest labelled section using the existing temporary-`tabindex` restoration pattern.

Derive:

```ts
const visible = !heroActionsVisible && !contentActionOverlaps && !finalVisible;
```

Remove `processVisible`, `faqVisible`, and section-wide observers.

- [ ] **Step 4: Render and style the Kakao mark**

Render the PNG with `next/image` at intrinsic `68×69`, CSS-scaled with `height: 22px; width: auto`. Replace the right-half copper background with `#FEE500`, set icon/text to black, and remove the old `.sticky-inquiry a + a svg` Kakao styling.

- [ ] **Step 5: Run focused GREEN tests**

Run:

```bash
npm run build
npm run test:static
npx playwright test tests/e2e/renewal.spec.ts --grep "mobile inquiry|sticky inquiry|Kakao contact"
```

Expected: all focused contracts pass with no skipped test.

- [ ] **Step 6: Run full verification and visual checks**

Run:

```bash
npm run verify
npx tsc --noEmit
npm audit --omit=dev
git diff --check
```

Inspect 320px, 390px, and 760px screenshots for safe-area placement, no horizontal overflow, no covered focus target, correct official mark ratio, and a readable 50/50 split.

- [ ] **Step 7: Commit, push, and verify the noindex preview**

```bash
git add public/images/kakao-talk-mark.png components/Hero.tsx components/StickyInquiryBar.tsx content/site.ts app/globals.css tests/static-export.test.mjs tests/e2e/renewal.spec.ts
git commit -m "feat: keep mobile contact actions available"
git push origin codex/trust-first-renewal
```

Wait for GitHub Verify. Confirm the branch preview returns HTTP 200 with `X-Robots-Tag: noindex`, the new asset returns `image/png`, and `main` remains unchanged.
