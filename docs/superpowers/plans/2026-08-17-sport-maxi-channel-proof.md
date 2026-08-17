# Sport Maxi and Channel Proof Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the bright preview's bulky hero scooter and mismatched header actions, and add three truthful channel proof badges to both preview branches without changing `main` or production.

**Architecture:** The bright branch receives versioned `v3` hero assets, a single header phone action, and a channel-proof row integrated into `TrustBar`. The dark branch receives only the same typed channel data and proof-row markup with dark-theme CSS. Every branch is tested, committed, pushed, and verified independently so no bright styling can leak into the dark preview.

**Tech Stack:** Next.js 16 static export, React 19, TypeScript, CSS, Sharp 0.35, Node test runner, Playwright Chromium, built-in ImageGen, GitHub Actions, Cloudflare Pages.

## Global Constraints

- Do not modify or merge `main`, the production domain, or DNS.
- Bright work happens only on `codex/brighter-preview`; dark work happens only on `codex/trust-first-renewal`.
- Use exactly `네이버 플레이스`, `카카오 공식채널`, and `당근 거래 활동`.
- Never export `인증 업체`, `공식 인증`, `플랫폼 추천`, or the unrelated Daangn slug `es1y136zzsue`.
- Naver links to `https://naver.me/F1rPbAcV`; Kakao links to `https://pf.kakao.com/_MzgSn`; Daangn remains non-interactive until a matching public URL is supplied.
- Keep hero Kakao, final Kakao, mobile sticky Kakao/phone, all existing CTA IDs, phone number, and canonical metadata intact.
- Use built-in ImageGen without an input or reference image. No logos, trademarks, brand-specific styling, license plates, text, watermarks, or people.
- Keep the current `v2` bright assets and `eba0d86` rollback point intact; add new `v3` sibling files.
- Keep the dark rollback point `0c794288` intact.
- All interactive targets remain at least 44px; all text contrast remains WCAG AA.

---

### Task 1: Add the channel proof data contract and row to the bright preview

**Files:**
- Modify: `content/site.ts`
- Modify: `components/TrustBar.tsx`
- Modify: `app/globals.css`
- Modify: `tests/static-export.test.mjs`
- Modify: `tests/e2e/renewal.spec.ts`

**Interfaces:**
- Consumes: existing `site.links.naverPlace`, current public icon files, and the existing `TrustBar` section.
- Produces: `ChannelProofId`, `ChannelProof`, and `site.trustSection.channels`, rendered as `.channel-proof` with three `.channel-proof__item` children.

- [ ] **Step 1: Write the failing static export contract**

Add a test that extracts the trust section from `out/index.html` and requires the three exact labels, the Naver and Kakao hrefs, and no anchor around the Daangn item:

```js
test("exports three factual channel proof badges", () => {
  const trust = html.match(/<section class="trust-bar"[\s\S]*?<\/section>/)?.[0] ?? "";
  assert.match(trust, />네이버 플레이스</);
  assert.match(trust, />카카오 공식채널</);
  assert.match(trust, />당근 거래 활동</);
  assert.match(trust, /href="https:\/\/naver\.me\/F1rPbAcV"/);
  assert.match(trust, /href="https:\/\/pf\.kakao\.com\/_MzgSn"/);
  assert.doesNotMatch(trust, /<a[^>]*>[\s\S]*?당근 거래 활동[\s\S]*?<\/a>/);
  assert.doesNotMatch(marketingSurface(html), /인증\s*업체|공식\s*인증|플랫폼\s*추천|es1y136zzsue/);
});
```

- [ ] **Step 2: Write the failing browser layout contract**

At 390px and 1440px, assert that all three items are visible in one row, Naver and Kakao links are at least 44px high, Daangn is a non-link element, and the document has no horizontal overflow:

```ts
for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
  await page.setViewportSize(viewport);
  await page.goto("/");
  const items = page.locator(".channel-proof__item");
  await expect(items).toHaveCount(3);
  const boxes = await items.evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect()));
  expect(Math.max(...boxes.map((box) => box.top)) - Math.min(...boxes.map((box) => box.top))).toBeLessThan(2);
  for (const link of await page.locator(".channel-proof a").all()) {
    expect((await link.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
  }
  await expect(page.locator(".channel-proof__item--daangn")).not.toHaveAttribute("href", /.+/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
}
```

- [ ] **Step 3: Run the focused tests and verify RED**

Run:

```bash
npm run build
node --test --test-name-pattern="channel proof" tests/static-export.test.mjs
npx playwright test tests/e2e/renewal.spec.ts --grep "channel proof"
```

Expected: static and browser tests fail because `.channel-proof` and the typed channel data do not exist.

- [ ] **Step 4: Add the typed single source of truth**

Add the exact types and data in `content/site.ts`:

```ts
export type ChannelProofId = "naver" | "kakao" | "daangn";

export type ChannelProof = Readonly<{
  id: ChannelProofId;
  label: string;
  icon: string;
  href?: string;
}>;

export type TrustSectionCopy = Readonly<{
  title: string;
  points: readonly [string, string, string, string];
  channelLabel: string;
  channels: readonly [ChannelProof, ChannelProof, ChannelProof];
}>;

const kakaoChannelUrl = "https://pf.kakao.com/_MzgSn";

channels: [
  { id: "naver", label: "네이버 플레이스", icon: "/images/naver-icon.png", href: naverPlaceUrl },
  { id: "kakao", label: "카카오 공식채널", icon: "/images/kakao-talk-mark.png", href: kakaoChannelUrl },
  { id: "daangn", label: "당근 거래 활동", icon: "/images/daangn-icon.png" },
] satisfies readonly [ChannelProof, ChannelProof, ChannelProof],
```

- [ ] **Step 5: Render semantic links and a non-interactive Daangn badge**

Extend `TrustBar.tsx` below the point grid. Use `<Image width={22} height={22} alt="" aria-hidden="true" />`; render Naver/Kakao as external `<a target="_blank" rel="noreferrer">` and Daangn as `<span>`.

- [ ] **Step 6: Add bright proof-row CSS**

Add a three-column grid inside the existing trust bar. Use the current stone/card surfaces, petrol text, 1px borders, 44px minimum height, 6–10px gaps, 20–22px icons, and `font-size: clamp(.62rem, 1.8vw, .82rem)`. The row must remain three columns at 320px without horizontal scrolling.

- [ ] **Step 7: Run focused GREEN and commit**

Run the Step 3 commands and `npx tsc --noEmit`. Expected: all pass.

```bash
git add content/site.ts components/TrustBar.tsx app/globals.css tests/static-export.test.mjs tests/e2e/renewal.spec.ts
git commit -m "feat: add factual channel proof row"
```

---

### Task 2: Simplify the bright header to one phone action

**Files:**
- Modify: `components/Header.tsx`
- Modify: `app/globals.css`
- Modify: `tests/static-export.test.mjs`
- Modify: `tests/e2e/renewal.spec.ts`

**Interfaces:**
- Consumes: `site.contact.headerPhone` and `site.phone.display`.
- Produces: one `.header-phone` link with `data-cta="header-phone"`, visible label `전화 상담`, and accessible name `전화 상담 010-7616-4949`.

- [ ] **Step 1: Write the failing header contract**

Scope assertions to the exported `<header>` so other Kakao CTAs and phone numbers remain valid:

```js
test("exports one concise header phone action", () => {
  const header = html.match(/<header[\s\S]*?<\/header>/)?.[0] ?? "";
  assert.match(header, /data-cta="header-phone"/);
  assert.match(header, />전화 상담</);
  assert.match(header, /aria-label="전화 상담 010-7616-4949"/);
  assert.doesNotMatch(header, /header-kakao|>카카오톡<|>010-7616-4949</);
});
```

Add E2E assertions at 320, 390, 768, and 1440px that `.site-header__actions` contains one link, the link is at least 44px high, uses the dark petrol fill and ivory foreground, and causes no header overlap or document overflow. Also assert `[data-cta="hero-kakao"]` and `[data-cta="sticky-kakao"]` still exist.

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```bash
npm run build
node --test --test-name-pattern="concise header" tests/static-export.test.mjs
npx playwright test tests/e2e/renewal.spec.ts --grep "single header phone"
```

Expected: failures show the existing header Kakao button and visible phone number.

- [ ] **Step 3: Implement the single action**

Remove `MessageCircle`, the `.header-kakao` anchor, and the visible phone number span. Render:

```tsx
<a
  className="header-phone"
  href={phone.href}
  data-cta={phone.ctaId}
  aria-label={`${phone.label} ${site.phone.display}`}
>
  <Phone aria-hidden="true" size={17} />
  <span>{phone.label}</span>
</a>
```

Remove obsolete `.header-kakao` and `.header-phone__hours` selectors. Give `.header-phone` a dark petrol background, ivory text, `border-radius: 12px`, and a quiet darker hover state. Preserve the 44px minimum target at every breakpoint.

- [ ] **Step 4: Run focused GREEN and commit**

Run the Step 2 commands plus `npm run lint` and `npx tsc --noEmit`. Expected: all pass.

```bash
git add components/Header.tsx app/globals.css tests/static-export.test.mjs tests/e2e/renewal.spec.ts
git commit -m "feat: simplify bright header inquiry action"
```

---

### Task 3: Generate and integrate the bright `v3` sport-maxi hero

**Files:**
- Create: `public/images/hero-source-v3.png`
- Create: `public/images/hero-mobile-source-v3.png`
- Create: `public/images/hero-bg-v3.webp`
- Create: `public/images/hero-mobile-v3.webp`
- Create: `public/images/og-bike-manager-v3.jpg`
- Modify: `scripts/optimize-images.mjs`
- Modify: `components/Hero.tsx`
- Modify: `app/layout.tsx`
- Modify: `content/site.ts`
- Modify: `app/globals.css`
- Modify: `tests/static-export.test.mjs`
- Modify: `tests/e2e/renewal.spec.ts`

**Interfaces:**
- Consumes: the existing `<picture>` art direction and Sharp optimization pipeline.
- Produces: 1440×900 desktop WebP at no more than 300KB, 640×1100 mobile WebP at no more than 180KB, and 1200×630 progressive JPEG at no more than 180KB.

- [ ] **Step 1: Write the failing versioned-asset contract**

Change the asset test to require only the exact `v3` paths, dimensions, complete Sharp decode, and budgets. Change the E2E gallery test to require the mobile or desktop `currentSrc` that matches its viewport. Run the focused tests and verify they fail on `v2`.

- [ ] **Step 2: Generate a new landscape original with built-in ImageGen**

Use no input or reference image. Use this prompt:

```text
Use case: ads-marketing
Asset type: premium Korean motorcycle-buying landing page hero
Primary request: create an exceptionally polished photorealistic editorial image of one sleek generic premium sport maxi scooter parked in a tidy modern concrete inspection workshop
Subject: one mechanically plausible unbranded 300–400cc-style sport maxi scooter, low long stance, taut athletic bodywork, compact windscreen, confident front wheel, refined satin graphite finish, no bulky touring proportions
Composition/framing: low camera height, dynamic front three-quarter view, complete wheels and mirrors, scooter occupies the right 48 percent, generous clean bright negative space on the left for Korean headline and buttons
Lighting/mood: directional soft morning window light with controlled highlights, premium but believable documentary product photography, calm and trustworthy
Color palette: graphite, mineral gray, warm ivory, muted eucalyptus, restrained steel
Constraints: mechanically correct wheels, fork, brakes, handlebar, mirrors, seat and body panels; generic design that does not identify a real manufacturer; no logos, trademarks, license plate, text, watermark, people or signage
Avoid: recognizable XMAX or Forza styling, cafe racer, naked motorcycle, huge windscreen, top box, bulky touring silhouette, toy-like proportions, duplicated parts, distorted wheels, orange light, cyan neon
```

- [ ] **Step 3: Generate a separate portrait original**

Repeat the same prompt without an input/reference image, changing composition to:

```text
Composition/framing: portrait mobile landing-page hero, low front three-quarter view, complete sleek scooter centered slightly right, clear upper-left and center-left copy space, both wheels and mirrors inside the safe crop
```

- [ ] **Step 4: Inspect and reject weak outputs**

Use visual inspection on both originals. Reject any output with brand-like emblems, pseudo-lettering, visible plate characters, impossible wheel/fork geometry, extra mirrors, cropped wheels, a bulky touring silhouette, or insufficient copy space. If an output fails, make one targeted edit/generation request that changes only the failed property.

- [ ] **Step 5: Save originals and optimize reproducibly**

Copy the selected built-in ImageGen results to the two exact `*-source-v3.png` paths. Update `scripts/optimize-images.mjs` to read those files and write the three exact `v3` outputs with Sharp. Run `npm run images:optimize` and confirm the printed sizes meet the budgets.

- [ ] **Step 6: Wire the new asset paths**

Update the hero `<picture>`, image preloads, OG image path/alt, and asset tests from `v2` to `v3`. Tune only the hero image filter and gradient wash if the actual generated image needs legibility correction; do not change layout or copy.

- [ ] **Step 7: Run focused GREEN, visually inspect, and commit**

Run:

```bash
npm run build
node --test --test-name-pattern="versioned local hero|Open Graph" tests/static-export.test.mjs
npx playwright test tests/e2e/renewal.spec.ts --grep "light mineral gallery|hero"
npx tsc --noEmit
```

Inspect 390×844 and 1440×900 screenshots for geometry, text readability, subject crop, and overflow.

```bash
git add public/images/hero-source-v3.png public/images/hero-mobile-source-v3.png public/images/hero-bg-v3.webp public/images/hero-mobile-v3.webp public/images/og-bike-manager-v3.jpg scripts/optimize-images.mjs components/Hero.tsx app/layout.tsx content/site.ts app/globals.css tests/static-export.test.mjs tests/e2e/renewal.spec.ts
git commit -m "feat: replace bright hero with sport maxi artwork"
```

---

### Task 4: Verify and publish the bright preview

**Files:**
- Verify only; no planned production source changes.

**Interfaces:**
- Consumes: Tasks 1–3 on `codex/brighter-preview`.
- Produces: a green branch and updated Cloudflare preview at `https://codex-brighter-preview.bike-manager.pages.dev/`.

- [ ] **Step 1: Run the complete local gate**

```bash
npm run verify
npx tsc --noEmit
npm audit --omit=dev
git diff --check
```

Expected: lint/build pass, every static and Chromium test passes with zero skips, typecheck passes, audit reports zero high/critical vulnerabilities, and diff-check is clean.

- [ ] **Step 2: Run mobile Lighthouse**

Serve `out/` and run Lighthouse for Performance, Accessibility, Best Practices, and SEO. Require Performance at least 95 and the other three scores at 100.

- [ ] **Step 3: Push and watch CI**

```bash
git push origin codex/brighter-preview
```

Watch the Verify workflow to completion. Do not force-push.

- [ ] **Step 4: Verify the deployed bright preview**

Require HTTP 200, `X-Robots-Tag: noindex`, all `v3` assets returning the correct image content type, three proof items, one header phone action, no console errors, and no overflow at 390px and 1440px.

---

### Task 5: Port only the channel proof row to the dark preview

**Files in `/Users/swlee724/Documents/bike-landing`:**
- Modify: `content/site.ts`
- Modify: `components/TrustBar.tsx`
- Modify: `app/globals.css`
- Modify: `tests/static-export.test.mjs`
- Modify: `tests/e2e/renewal.spec.ts`
- Add or cherry-pick: `docs/superpowers/specs/2026-08-17-sport-maxi-channel-proof-design.md`

**Interfaces:**
- Consumes: the exact `ChannelProof` contract and markup from Task 1, plus the dark branch's existing palette.
- Produces: the same three badges on `codex/trust-first-renewal` without any bright header, hero, CTA, or gallery changes.

- [ ] **Step 1: Confirm the dark worktree and clean baseline**

In `/Users/swlee724/Documents/bike-landing`, assert the current branch is `codex/trust-first-renewal`, the worktree is clean, and `origin/codex/trust-first-renewal` still points at `0c794288` before editing.

- [ ] **Step 2: Add dark RED contracts**

Add the same static channel proof test from Task 1. Add 390px and 1440px E2E checks for three same-row items, 44px Naver/Kakao links, non-interactive Daangn, no overflow, and computed dark surfaces. Run build and focused tests; require failures because the row is absent.

- [ ] **Step 3: Port the exact typed data and markup**

Apply the `ChannelProofId`, `ChannelProof`, `kakaoChannelUrl`, `site.trustSection.channels`, and `TrustBar` markup from Task 1 without importing any bright header or hero changes.

- [ ] **Step 4: Add dark-only CSS**

Use a deep-petrol/charcoal row, light text, quiet steel borders, and platform color only inside the three icon images. Preserve the current dark section order and trust-point appearance. Keep the three-column mobile grid and 44px links.

- [ ] **Step 5: Run focused GREEN and commit**

```bash
npm run build
node --test --test-name-pattern="channel proof" tests/static-export.test.mjs
npx playwright test tests/e2e/renewal.spec.ts --grep "channel proof"
npx tsc --noEmit
git diff --check
git add content/site.ts components/TrustBar.tsx app/globals.css tests/static-export.test.mjs tests/e2e/renewal.spec.ts docs/superpowers/specs/2026-08-17-sport-maxi-channel-proof-design.md
git commit -m "feat: add channel proof to dark preview"
```

- [ ] **Step 6: Run the complete dark gate**

Run `npm run verify`, `npx tsc --noEmit`, `npm audit --omit=dev`, and mobile Lighthouse. Require Performance at least 95, other categories at 100, zero skipped tests, and no high/critical audit findings.

- [ ] **Step 7: Push and verify only the dark preview**

Push `codex/trust-first-renewal`, watch CI, and verify `https://codex-trust-first-renewal.bike-manager.pages.dev/` returns HTTP 200 plus `X-Robots-Tag: noindex`. Confirm the old dark hero/header and the new three proof items, and confirm `origin/main` remains `d36c2e5`.

---

### Task 6: Final cross-preview audit

**Files:**
- Verify only.

**Interfaces:**
- Consumes: the two deployed preview URLs and their final remote branch SHAs.
- Produces: a concise handoff with both URLs, rollback SHAs, image paths/prompts, and verification evidence.

- [ ] **Step 1: Compare the two live previews**

At 390px and 1440px confirm both show the same three channel badges, while only the bright preview has the sport-maxi `v3` hero and single header phone action.

- [ ] **Step 2: Confirm isolation**

Run `git ls-remote` for `codex/brighter-preview`, `codex/trust-first-renewal`, and `main`. Confirm only the two preview branches advanced and `main` remains unchanged.

- [ ] **Step 3: Report the final generated assets**

Report the two original `v3` PNG paths, three optimized output paths, the complete prompt set, built-in ImageGen mode, live preview URLs, rollback SHAs, CI results, Lighthouse scores, and audit result.
