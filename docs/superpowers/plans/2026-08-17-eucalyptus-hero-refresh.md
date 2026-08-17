# Eucalyptus Hero Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the bright preview's orange marketing CTAs and mismatched neon motorcycle hero with a calm eucalyptus CTA system and locally hosted, newly generated, unbranded maxi-scooter imagery.

**Architecture:** Keep the existing server-rendered hero and CTA links intact. Add versioned local image assets, point the existing `<picture>` and metadata at them, and update only shared CSS color tokens and image treatment. Lock the asset dimensions, budgets, paths, contrast, responsive crop, CTA identifiers, and existing interaction behavior with static-export and Playwright tests.

**Tech Stack:** Next.js 16 static export, React 19, CSS, Sharp 0.35, Node test runner, Playwright Chromium, built-in ImageGen.

## Global Constraints

- Only `codex/brighter-preview` and `https://codex-brighter-preview.bike-manager.pages.dev/` may change.
- Do not change `main`, the dark preview, the production domain, or DNS.
- Primary CTA background is `#2F5D55`; CTA foreground is `#F5F1E8`; hover background is `#244A45`.
- Kakao yellow stays limited to the official mobile sticky action and official mark.
- Hero imagery must be generated without source images and contain no logos, trademarks, brand-specific marks, license plates, text, watermark, or people.
- Hero subject is a realistic premium maxi scooter in a tidy daylight concrete workshop, not a cafe racer, racing motorcycle, or luxury tourer.
- Keep all copy, URL destinations, `data-cta` values, layout order, interaction state, and sticky inquiry behavior unchanged.
- Use versioned files; do not overwrite the current hero assets. Rollback target remains `b764a25`.
- Desktop hero WebP must be 1440×900 and at most 300KB. Mobile hero WebP must be 640×1100 and at most 180KB. OG JPEG must be 1200×630 and at most 180KB.
- Lighthouse goals: Performance at least 95; Accessibility, Best Practices, and SEO 100.

---

### Task 1: Lock the CTA and Local Hero Asset Contract

**Files:**
- Modify: `tests/static-export.test.mjs`
- Modify: `tests/e2e/renewal.spec.ts`

**Interfaces:**
- Consumes: exported `out/index.html`, exported CSS, and local public image assets.
- Produces: failing contracts for `hero-bg-v2.webp`, `hero-mobile-v2.webp`, `og-bike-manager-v2.jpg`, eucalyptus CTA colors, asset budgets, and responsive loading.

- [ ] **Step 1: Add the failing static-export test**

Add a test that asserts the exported hero picture uses only the three new local paths and that Sharp fully decodes the three assets at the exact dimensions and byte budgets:

```js
test("exports versioned unbranded hero assets within the approved budgets", async () => {
  assert.match(html, /src="\/images\/hero-bg-v2\.webp"/);
  assert.match(html, /srcSet="\/images\/hero-mobile-v2\.webp"/);
  assert.match(html, /content="https:\/\/www\.bike-manager\.com\/images\/og-bike-manager-v2\.jpg"/);
  assert.doesNotMatch(html, /src="\/images\/hero-bg\.webp"|srcSet="\/images\/hero-mobile\.webp"/);

  for (const contract of [
    { path: "hero-bg-v2.webp", width: 1440, height: 900, max: 300 * 1024, format: "webp" },
    { path: "hero-mobile-v2.webp", width: 640, height: 1100, max: 180 * 1024, format: "webp" },
    { path: "og-bike-manager-v2.jpg", width: 1200, height: 630, max: 180 * 1024, format: "jpeg" },
  ]) {
    const asset = new URL(`../out/images/${contract.path}`, import.meta.url);
    const [{ size }, metadata, pixels] = await Promise.all([
      stat(asset),
      sharp(fileURLToPath(asset)).metadata(),
      sharp(fileURLToPath(asset)).raw().toBuffer(),
    ]);
    assert.equal(metadata.format, contract.format);
    assert.equal(metadata.width, contract.width);
    assert.equal(metadata.height, contract.height);
    assert.ok(pixels.byteLength > 0);
    assert.ok(size <= contract.max, `${contract.path} is ${Math.ceil(size / 1024)}KB`);
  }
});
```

Update the palette test to require `--cta:#2f5d55`, `--cta-hover:#244a45`, `--cta-foreground:#f5f1e8`, and reject `--orange:#ff6645`.

- [ ] **Step 2: Add the failing rendered CTA and hero test**

Extend the light gallery Playwright contract at 390px and 1440px:

```ts
expect(surfaces.primaryCta.background).toBe("rgb(47, 93, 85)");
expect(surfaces.primaryCta.color).toBe("rgb(245, 241, 232)");
expect(contrastRatio(parseCssColor(surfaces.primaryCta.color), parseCssColor(surfaces.primaryCta.background))).toBeGreaterThanOrEqual(4.5);

const heroImage = page.locator(".hero__image");
await expect(heroImage).toHaveJSProperty("complete", true);
expect(await heroImage.getAttribute("src")).toBe("/images/hero-bg-v2.webp");
expect(await page.locator(".hero source").getAttribute("srcset")).toBe("/images/hero-mobile-v2.webp");
```

Keep all current CTA target, `data-cta`, 44px target, overflow, sticky bar, and transition assertions.

- [ ] **Step 3: Build and verify RED**

Run:

```bash
npm run build
node --test --test-name-pattern="versioned unbranded hero|approved petrol" tests/static-export.test.mjs
npx playwright test tests/e2e/renewal.spec.ts --grep "full light mineral gallery"
```

Expected: static tests fail because the new assets and eucalyptus tokens do not exist; Playwright fails because the primary CTA is still orange and the hero still references the old files.

- [ ] **Step 4: Commit the failing contract**

```bash
git add tests/static-export.test.mjs tests/e2e/renewal.spec.ts
git commit -m "test: require eucalyptus CTA and original hero assets"
```

---

### Task 2: Generate, Inspect, and Optimize the Hero Assets

**Files:**
- Create: `public/images/hero-source-v2.png`
- Create: `public/images/hero-mobile-source-v2.png`
- Create: `public/images/hero-bg-v2.webp`
- Create: `public/images/hero-mobile-v2.webp`
- Create: `public/images/og-bike-manager-v2.jpg`
- Modify: `scripts/optimize-images.mjs`
- Modify: `components/Hero.tsx`
- Modify: `app/layout.tsx`
- Modify: `content/site.ts`

**Interfaces:**
- Consumes: the exact asset names and dimensions from Task 1.
- Produces: local, versioned, fully decodable images used by the hero preload, `<picture>`, and production-canonical OG metadata.

- [ ] **Step 1: Generate a landscape original with built-in ImageGen**

Use no input or reference image. Prompt:

```text
Use case: ads-marketing
Asset type: premium Korean motorcycle-buying landing page hero
Primary request: create a photorealistic editorial image of one generic premium maxi scooter parked inside a tidy modern concrete inspection workshop in soft morning daylight
Scene/backdrop: calm stone-gray concrete, subtle pale petrol and eucalyptus details, clean floor, no clutter, no city or neon
Subject: one realistic unbranded 300–350cc-style maxi scooter, front three-quarter view, placed in the right 45 percent
Composition/framing: wide landscape, generous clean bright negative space on the left for Korean headline and buttons, complete wheels and mirrors visible
Lighting/mood: soft natural window light, calm, trustworthy, refined, documentary product photography
Color palette: mineral gray, warm ivory, muted eucalyptus, restrained steel
Constraints: mechanically plausible wheels, suspension, handlebar, mirrors and body panels; no logos, no trademarks, no brand-specific styling, no license plate, no text, no watermark, no people
Avoid: cafe racer, racing motorcycle, luxury touring motorcycle, orange lighting, cyan neon, dramatic night scene, showroom signage, duplicated parts, distorted wheels
```

- [ ] **Step 2: Generate a matching portrait original**

Use no input or reference image. Repeat the same scene and constraints, changing only composition:

```text
Composition/framing: portrait landing-page hero, complete scooter in front three-quarter view centered slightly right, clear upper-left and center-left space for Korean copy, enough floor around both wheels for safe mobile cropping
```

- [ ] **Step 3: Inspect both generated originals before copying**

Use visual inspection to reject any image with text, marks, plate characters, people, broken wheel geometry, impossible forks, extra mirrors, duplicated controls, cropped wheels, or a visually recognizable manufacturer design. Iterate with one targeted prompt correction if either image fails.

- [ ] **Step 4: Save selected originals and make optimization reproducible**

Copy selected generated outputs into the two `*-source-v2.png` paths. Update `scripts/optimize-images.mjs`:

```js
await sharp("public/images/hero-source-v2.png")
  .resize(1440, 900, { fit: "cover", position: "centre" })
  .webp({ quality: 72, effort: 6 })
  .toFile("public/images/hero-bg-v2.webp");

await sharp("public/images/hero-mobile-source-v2.png")
  .resize(640, 1100, { fit: "cover", position: "centre" })
  .webp({ quality: 70, effort: 6 })
  .toFile("public/images/hero-mobile-v2.webp");

await sharp("public/images/hero-source-v2.png")
  .resize(1200, 630, { fit: "cover", position: "centre" })
  .jpeg({ quality: 80, progressive: true, mozjpeg: true })
  .toFile("public/images/og-bike-manager-v2.jpg");
```

Keep the existing favicon optimization. Add all three new outputs to the script's file-size report.

- [ ] **Step 5: Point every consumer at the versioned assets**

- `Hero.tsx`: use `/images/hero-bg-v2.webp` and `/images/hero-mobile-v2.webp`.
- `layout.tsx`: preload those exact paths.
- `content/site.ts`: set `ogImage` to `/images/og-bike-manager-v2.jpg` and update only its factual alt to describe an unbranded maxi scooter in a bright inspection workshop.

- [ ] **Step 6: Optimize and verify the asset contract is GREEN**

Run:

```bash
node scripts/optimize-images.mjs
npm run build
node --test --test-name-pattern="versioned unbranded hero|Open Graph" tests/static-export.test.mjs
```

Expected: all selected static tests pass and reported file sizes stay within the global constraints.

- [ ] **Step 7: Commit the asset replacement**

```bash
git add public/images/hero-source-v2.png public/images/hero-mobile-source-v2.png public/images/hero-bg-v2.webp public/images/hero-mobile-v2.webp public/images/og-bike-manager-v2.jpg scripts/optimize-images.mjs components/Hero.tsx app/layout.tsx content/site.ts
git commit -m "feat: add original daylight maxi scooter hero"
```

---

### Task 3: Replace Orange Marketing Actions with Eucalyptus

**Files:**
- Modify: `app/globals.css`
- Test: `tests/static-export.test.mjs`
- Test: `tests/e2e/renewal.spec.ts`

**Interfaces:**
- Consumes: Task 1 CTA tokens and existing `.button--primary` and `.visit-flow__cta` selectors.
- Produces: one calm CTA treatment without changing links or component markup.

- [ ] **Step 1: Define the new tokens and remove the orange token**

In `:root`:

```css
--cta: #2f5d55;
--cta-hover: #244a45;
--cta-foreground: #f5f1e8;
```

Remove `--orange`. Change selection to a translucent eucalyptus wash with ink text.

- [ ] **Step 2: Apply the tokens only to marketing actions**

```css
.button--primary,
.visit-flow__cta {
  background: var(--cta);
  color: var(--cta-foreground);
}

.button--primary:hover,
.visit-flow__cta:hover {
  background: var(--cta-hover);
}
```

Do not recolor the official Kakao yellow sticky action. Preserve all target sizes, radii, focus rings, and transform limits.

- [ ] **Step 3: Tune the light hero overlay for the new daylight photograph**

Reduce the opaque mineral wash only enough for the workshop and scooter to remain identifiable while keeping headline contrast at least 4.5:1. Keep all changes in `.hero__image` and `.hero__shade`; do not change the DOM or copy.

- [ ] **Step 4: Build and verify focused GREEN**

Run:

```bash
npm run build
node --test --test-name-pattern="approved petrol|full light mineral gallery|versioned unbranded hero" tests/static-export.test.mjs
npx playwright test tests/e2e/renewal.spec.ts --grep "full light mineral gallery|hero title|320px|390px|1440px"
```

Expected: all focused tests pass with no undersized targets, overflow, or contrast failures.

- [ ] **Step 5: Visually inspect responsive crops and CTA hierarchy**

Inspect 390×844 and 1440×900. At both sizes, confirm the bike is immediately identifiable, copy remains the first reading target, CTA is prominent without dominating the page, and no generated artifact or mark appears.

- [ ] **Step 6: Commit the CTA and hero treatment**

```bash
git add app/globals.css tests/static-export.test.mjs tests/e2e/renewal.spec.ts
git commit -m "feat: calm preview actions with eucalyptus CTA"
```

---

### Task 4: Full Verification and Preview Deployment

**Files:**
- Verify only unless a test exposes a scoped defect.

**Interfaces:**
- Consumes: Tasks 1–3.
- Produces: a deployed bright preview with no changes to the dark preview or `main`.

- [ ] **Step 1: Run the full local gate**

```bash
npm run verify
npx tsc --noEmit
npm audit --omit=dev
git diff --check
```

Expected: zero failures, warnings treated according to existing project policy, and zero high/critical production vulnerabilities.

- [ ] **Step 2: Run mobile Lighthouse**

Serve the static export and audit the preview. Require Performance at least 95 and the other three categories at 100.

- [ ] **Step 3: Self-review the complete diff**

Confirm only approved preview assets, CSS, consumers, tests, scripts, spec, and plan changed. Confirm all existing URL, phone, CTA IDs, case data, and interaction code remain unchanged.

- [ ] **Step 4: Push only the brighter preview branch**

```bash
git push origin codex/brighter-preview
```

Wait for the GitHub Verify workflow to pass.

- [ ] **Step 5: Verify Cloudflare and branch isolation**

Confirm:

- `https://codex-brighter-preview.bike-manager.pages.dev/` returns HTTP 200 and `X-Robots-Tag: noindex`.
- Desktop and mobile remote renders use the new local hero assets and eucalyptus CTA.
- `origin/codex/trust-first-renewal` and `origin/main` SHAs remain unchanged.
- The dark preview still renders its dark petrol frames.

- [ ] **Step 6: Preserve rollback information**

Report final commit SHA, preview URL, test counts, Lighthouse scores, and rollback commit `b764a25`.
