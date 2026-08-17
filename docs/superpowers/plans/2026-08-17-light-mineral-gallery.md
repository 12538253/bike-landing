# Light Mineral Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert `codex/brighter-preview` from a dark-frame/light-middle composition into one cohesive, refined light mineral gallery from header through footer.

**Architecture:** Preserve all React component structure, typed content, assets, links, CTA identifiers, and interaction state. Replace the visual system in `app/globals.css`, then lock the exported tokens and browser-computed surfaces with static and Playwright contracts. Use the existing bright-preview worktree and deploy only the same Cloudflare branch preview.

**Tech Stack:** Next.js 16 static export, React 19, TypeScript, CSS, Playwright, Node test runner, Lighthouse CLI, Cloudflare Pages.

## Global Constraints

- Change only `codex/brighter-preview`; do not modify `main`, the dark preview branch, production DNS, or the production domain.
- Preserve all visible copy, actual images, section order, telephone/Kakao/Naver URLs, CTA IDs, and existing interaction behavior.
- Use exact surfaces: `#DADDD8`, `#E3E4DF`, `#F0EFEA`, `#D7D2C5`, `#C8CECA`, and `#B8BFBB`.
- Use `#0C1A1C` as the primary ink, `#4A595B` as secondary text, `#6A4F2C` as brass, and `#FF6645` only for primary inquiry actions.
- Do not add dark-mode toggles, new JavaScript state, external libraries, images, analytics, WebGL, or video.
- Maintain at least 4.5:1 normal-text contrast, 3:1 icon/focus contrast, and 44px primary action targets.
- Keep mobile sticky inquiry visibility, focus transfer, safe-area handling, reduced-motion behavior, JS-off fallback, and 200% text zoom behavior unchanged.

---

### Task 1: Lock the full-light visual contract

**Files:**
- Modify: `tests/static-export.test.mjs:565-582`
- Modify: `tests/e2e/renewal.spec.ts:1091-1195`

**Interfaces:**
- Consumes: exported `out/_next/static/css/*.css`, existing `parseCssColor()` and `contrastRatio()` test helpers.
- Produces: exact static token contract and 390px/1440px computed-surface contract used by Tasks 2 and 3.

- [ ] **Step 1: Replace the old midtone static contract with the full-light token contract**

```js
test("exports the full light mineral gallery without large dark frame surfaces", () => {
  assert.match(stylesheet, /--gallery-canvas:#daddd8/);
  assert.match(stylesheet, /--gallery-alt:#e3e4df/);
  assert.match(stylesheet, /--gallery-card:#f0efea/);
  assert.match(stylesheet, /--gallery-active:#d7d2c5/);
  assert.match(stylesheet, /--gallery-bridge:#c8ceca/);
  assert.match(stylesheet, /--gallery-footer:#b8bfbb/);
  assert.doesNotMatch(stylesheet, /background:#071315/);
});
```

- [ ] **Step 2: Replace the midtone Playwright contract with all major frame surfaces**

Cover `.site-header`, `.hero`, `.trust-bar`, `#process`, `#cases`, `[data-testid="quote-checklist"]`, `#faq`, `#contact`, `.site-footer`, `.sticky-inquiry`, `.visit-flow__stage`, `.case-card`, and `.quote-list li`.

```ts
const expectedBackgrounds = {
  header: "rgba(227, 228, 223, 0.94)",
  hero: "rgb(218, 221, 216)",
  trust: "rgb(200, 206, 202)",
  process: "rgb(218, 221, 216)",
  cases: "rgb(227, 228, 223)",
  quote: "rgb(218, 221, 216)",
  support: "rgb(227, 228, 223)",
  card: "rgb(240, 239, 234)",
  activeStage: "rgb(215, 210, 197)",
  contact: "rgb(200, 206, 202)",
  footer: "rgb(184, 191, 187)",
} as const;
```

For each text-bearing surface, assert `contrastRatio(...) >= 4.5`; for trust icons and focus indicators assert `>= 3`; for the primary CTA assert `>= 4.5`. Assert header, hero, contact, and footer are not `rgb(12, 26, 28)`.

- [ ] **Step 3: Run the static contract and verify RED**

Run: `npm run build`

Run: `node --test --test-name-pattern="full light mineral gallery" tests/static-export.test.mjs`

Expected: FAIL because the gallery tokens and light frame backgrounds do not exist.

- [ ] **Step 4: Run the browser contract and verify RED**

Run: `npx playwright test tests/e2e/renewal.spec.ts -g "full light mineral gallery"`

Expected: FAIL first at the header or hero, which still computes to a dark petrol background.

- [ ] **Step 5: Commit the failing contracts**

```bash
git add tests/static-export.test.mjs tests/e2e/renewal.spec.ts
git commit -m "test: require full light mineral gallery surfaces"
```

---

### Task 2: Convert the shared palette, body sections, cards, and photos

**Files:**
- Modify: `app/globals.css:1-25`
- Modify: `app/globals.css:420-910`
- Test: `tests/static-export.test.mjs`
- Test: `tests/e2e/renewal.spec.ts`

**Interfaces:**
- Consumes: Task 1 exact gallery token names.
- Produces: reusable CSS variables and unified body/card surfaces for Task 3 frame components.

- [ ] **Step 1: Replace the current surface variables**

```css
:root {
  --gallery-canvas: #daddd8;
  --gallery-alt: #e3e4df;
  --gallery-card: #f0efea;
  --gallery-active: #d7d2c5;
  --gallery-bridge: #c8ceca;
  --gallery-footer: #b8bfbb;
  --ink: #0c1a1c;
  --muted: #4a595b;
  --brass-deep: #6a4f2c;
  --orange: #ff6645;
  --line: rgba(12, 26, 28, 0.17);
}
```

Remove the obsolete `--surface-bridge`, `--surface-base`, `--surface-alt`, `--surface-card`, and `--surface-active` variables.

- [ ] **Step 2: Apply the shared body and card surfaces**

```css
body,
.hero,
.section--paper,
.section--paths,
[data-testid="quote-checklist"] {
  background: var(--gallery-canvas);
  color: var(--ink);
}

.case-section,
.support-section {
  background: var(--gallery-alt);
}

.visit-flow__stage,
.case-card,
.quote-list li,
.visit-flow[data-enhanced="true"] .visit-flow__stage-summary,
.visit-flow[data-enhanced="true"] .visit-flow__stage-panel {
  background: var(--gallery-card);
}

.visit-flow[data-enhanced="true"] .visit-flow__stage[data-active="true"] .visit-flow__stage-summary {
  background: var(--gallery-active);
}
```

- [ ] **Step 3: Retune case photography**

```css
.case-card__media img {
  filter: saturate(0.78) contrast(1.03) brightness(1.02);
}
```

Keep the existing 1.03 hover scale, object positions, local assets, and image budgets unchanged.

- [ ] **Step 4: Build and run the focused contracts**

Run: `npm run build`

Run: `node --test --test-name-pattern="full light mineral gallery" tests/static-export.test.mjs`

Run: `npx playwright test tests/e2e/renewal.spec.ts -g "full light mineral gallery"`

Expected: static tokens pass; body/card assertions pass; frame assertions for header/hero/contact/footer remain RED until Task 3.

- [ ] **Step 5: Commit the shared surface implementation**

```bash
git add app/globals.css
git commit -m "feat: unify preview body with mineral gallery surfaces"
```

---

### Task 3: Convert the header, hero, final contact, footer, and sticky inquiry

**Files:**
- Modify: `app/globals.css:132-420`
- Modify: `app/globals.css:958-1165`
- Modify: `app/globals.css:1206-1214`
- Modify: `app/globals.css:1276-1318`
- Test: `tests/e2e/renewal.spec.ts`

**Interfaces:**
- Consumes: Task 2 gallery variables.
- Produces: one continuous light frame from fixed header to mobile sticky inquiry and footer.

- [ ] **Step 1: Convert the fixed header**

```css
.site-header {
  border-bottom: 1px solid var(--line);
  background: rgba(227, 228, 223, 0.94);
  color: var(--ink);
  backdrop-filter: blur(16px);
}

.site-nav a,
.brand-mark,
.header-phone,
.header-kakao {
  color: var(--ink);
}
```

Retune the header action borders to `rgba(12, 26, 28, 0.24)` and their hover fill to `rgba(12, 26, 28, 0.06)`.

- [ ] **Step 2: Convert the hero to a light editorial photo treatment**

```css
.hero {
  background: var(--gallery-canvas);
  color: var(--ink);
}

.hero__image {
  filter: saturate(0.76) contrast(0.94) brightness(1.13);
}

.hero__shade {
  background:
    linear-gradient(90deg, rgba(218, 221, 216, 0.98) 0%, rgba(218, 221, 216, 0.91) 42%, rgba(218, 221, 216, 0.5) 69%, rgba(218, 221, 216, 0.18) 100%),
    linear-gradient(0deg, rgba(218, 221, 216, 0.7) 0%, transparent 50%);
}
```

Change hero title/note/description/scroll text to `var(--ink)` or `var(--muted)`. Change `.button--ghost` to a transparent light button with `border-color: rgba(12, 26, 28, 0.34)` and dark text. In the 761–1100px and mobile media queries, replace dark gradients with stronger light mineral washes rather than reverting to petrol.

- [ ] **Step 3: Convert final contact and footer**

```css
.final-section {
  background: var(--gallery-bridge);
  color: var(--ink);
}

.final-location {
  border-color: var(--line);
  background: var(--gallery-card);
}

.site-footer {
  border-top: 1px solid var(--line);
  background: var(--gallery-footer);
  color: var(--ink);
}
```

Replace all footer white-alpha text with `var(--muted)` and keep computed footer small text at 13–14px.

- [ ] **Step 4: Convert the mobile sticky inquiry**

```css
.sticky-inquiry {
  border-color: rgba(12, 26, 28, 0.18);
  background: rgba(240, 239, 234, 0.96);
  box-shadow: 0 14px 36px rgba(12, 26, 28, 0.16);
}

.sticky-inquiry a {
  color: var(--ink);
}
```

Keep the Kakao half `#FEE500`, existing `inert` behavior, focus transfer, transforms, visibility timing, and safe-area positioning unchanged.

- [ ] **Step 5: Build and run all focused visual contracts**

Run: `npm run build`

Run: `node --test --test-name-pattern="full light mineral gallery" tests/static-export.test.mjs`

Run: `npx playwright test tests/e2e/renewal.spec.ts -g "full light mineral gallery|focus indicator|footer small type|sticky inquiry"`

Expected: all focused tests PASS at 390px and 1440px.

- [ ] **Step 6: Inspect actual 390px and 1440px renders**

At 390×844 verify the hero remains readable over the brightened mobile crop, both hero CTAs remain fully visible, and the sticky inquiry is visually separate from content. At 1440×900 verify the left-to-right hero gradient reveals the bike photo without a dark block, and header→hero→trust→body and FAQ→contact→footer transitions appear continuous.

- [ ] **Step 7: Commit the light frame implementation**

```bash
git add app/globals.css tests/static-export.test.mjs tests/e2e/renewal.spec.ts
git commit -m "feat: complete light mineral gallery preview"
```

---

### Task 4: Full regression, quality gate, and branch-preview deployment

**Files:**
- Verify only: entire project

**Interfaces:**
- Consumes: Tasks 1–3 completed branch.
- Produces: verified commit and updated `codex-brighter-preview` Cloudflare preview.

- [ ] **Step 1: Run the full automated suite**

Run: `npm run verify`

Expected: lint, static export, all static tests, and all Chromium tests PASS with zero skips.

- [ ] **Step 2: Run type and dependency checks**

Run: `npx tsc --noEmit`

Run: `npm audit --omit=dev`

Expected: type check exits 0; high and critical vulnerabilities are 0.

- [ ] **Step 3: Run Lighthouse mobile**

Run the production export at `http://127.0.0.1:4173/` and save JSON to `/private/tmp/bike-light-gallery-lighthouse.json`.

Expected: Performance >= 0.95, Accessibility = 1, Best Practices = 1, SEO = 1, CLS = 0.

- [ ] **Step 4: Perform the complete responsive interaction pass**

Verify 320, 390, 768, 960, and 1440 widths for horizontal overflow, 44px actions, header collisions, case readability, FAQ overlap, and sticky inquiry visibility. Recheck VisitFlow hover/focus/click, reduced motion, JavaScript-off fallback, 200% text zoom, hash navigation, console errors, and hydration errors.

- [ ] **Step 5: Review and commit any verification-only contract refinements**

```bash
git diff --check
git status --short
git add app/globals.css tests/static-export.test.mjs tests/e2e/renewal.spec.ts
git commit -m "test: verify full light gallery preview"
```

Skip this commit if verification creates no tracked changes.

- [ ] **Step 6: Push only the bright comparison branch**

```bash
git push origin codex/brighter-preview
```

Wait for the branch Verify workflow. Confirm `https://codex-brighter-preview.bike-manager.pages.dev/` returns HTTP 200 and `X-Robots-Tag: noindex`.

- [ ] **Step 7: Confirm isolation and rollback**

Verify `origin/main` and `origin/codex/trust-first-renewal` hashes are unchanged. Keep `b9e4fec` available as the rollback point for the previous midtone version.
