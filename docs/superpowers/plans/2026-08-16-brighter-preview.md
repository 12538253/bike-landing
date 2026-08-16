# Brighter Comparison Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a second, brighter Cloudflare Pages preview that preserves the approved landing structure and behavior while shifting the body to a light 60 / dark 40 visual balance.

**Architecture:** Keep the current component tree, content model, assets, and interactive state unchanged. Add explicit brighter-preview surface tokens in `app/globals.css`, attach one semantic light-case class in `CaseStudies`, and restyle the trust, visit-flow, case, quote, and support surfaces while retaining the dark header, hero, final CTA, and footer.

**Tech Stack:** Next.js 16 static export, React 19, TypeScript, CSS, Playwright, Node test runner.

## Global Constraints

- Work only in `.worktrees/brighter-preview` on `codex/brighter-preview`.
- Do not push or modify `codex/trust-first-renewal`, `main`, the production domain, DNS, analytics, or content URLs.
- Preserve every visible Korean sentence, CTA label, CTA ID, section order, image path, and interaction state.
- Preserve `#FF6645` action orange, `#FEE500` Kakao yellow, and the existing dark header/final/footer.
- Add no dependencies, external requests, new images, SDKs, or client components.
- Maintain reduced-motion, JavaScript-off, keyboard, 200% text zoom, and mobile sticky inquiry behavior.

---

### Task 1: Lock the brighter visual behavior with a failing browser contract

**Files:**
- Modify: `tests/e2e/renewal.spec.ts`

**Interfaces:**
- Consumes: current section IDs/classes (`.hero`, `.trust-bar`, `#process`, `#cases`, `[data-testid="quote-checklist"]`, `#faq`, `#contact`).
- Produces: a rendered-color and contrast contract for the comparison preview.

- [ ] **Step 1: Add one rendered-surface test**

Add a Playwright test named `brighter preview keeps the brand frame dark and the decision surfaces light`. At `390×844` and `1440×900`, load `/` and assert literal computed backgrounds:

```ts
const expectedBackgrounds = {
  trust: "rgb(232, 225, 213)",
  process: "rgb(246, 242, 233)",
  cases: "rgb(255, 250, 243)",
  quote: "rgb(241, 237, 228)",
  support: "rgb(250, 247, 240)",
  contact: "rgb(12, 26, 28)",
} as const;
```

Read each computed background from the real rendered section. Assert the process heading, case heading, and trust-point text each have at least `4.5:1` contrast against their section surface using the existing `contrastRatio()` helper. Assert the hero and final section still use white foreground text and dark frame surfaces.

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npm run build
npx playwright test tests/e2e/renewal.spec.ts --grep "brighter preview"
```

Expected: FAIL because the trust, process, and case sections still compute to dark petrol backgrounds and the light case class is absent.

- [ ] **Step 3: Commit the failing contract**

```bash
git add tests/e2e/renewal.spec.ts
git commit -m "test: require brighter comparison surfaces"
```

---

### Task 2: Apply the brighter editorial palette

**Files:**
- Modify: `app/globals.css`
- Modify: `components/CaseStudies.tsx`
- Modify: `components/VisitFlowSection.tsx`

**Interfaces:**
- Consumes: existing dark/paper palette and component class names.
- Produces: `--preview-paper`, `--preview-paper-bright`, `--preview-band`, and `.case-section` light-surface behavior.

- [ ] **Step 1: Add the preview surface tokens and brighten the hero photo**

Add these literal tokens without replacing the existing approved palette:

```css
--preview-paper: #f6f2e9;
--preview-paper-bright: #fffaf3;
--preview-band: #e8e1d5;
```

Change the hero image filter to `saturate(0.72) contrast(1.05) brightness(0.78)`. Keep the left shade at least `rgba(12, 26, 28, 0.94)` and reduce only the right/bottom/radial shade density so the bike becomes clearer without reducing title contrast.

- [ ] **Step 2: Convert trust and visit-flow surfaces**

Use `--preview-band` for `.trust-bar`, dark line borders, `var(--ink)` text, and `var(--brass-deep)` icons. Use `--preview-paper` for `.section--paths`; remove `section-heading--light` from `VisitFlowSection` so headings inherit the dark-text treatment.

Replace white-alpha visit-flow borders, tags, body copy, safety text, active state, and panel divider with `var(--line)`, `var(--muted)`, `var(--ink-soft)`, and brass-alpha equivalents appropriate to the light surface. Use `--preview-paper-bright` for `.visit-flow__stage`.

- [ ] **Step 3: Convert case, quote, and support surfaces**

Change the CaseStudies section to `className="section case-section"` and remove `section-heading--light`. Style `.case-section` with `--preview-paper-bright`, dark text, light cards, dark source links, and existing brass accents. Change case image filter to `saturate(0.9) contrast(1.03) brightness(1.03)`.

Keep QuoteChecklist on the existing `--paper` and set `.support-section` to `--paper-bright` with a dark top divider. Do not alter markup or copy in quote/support.

- [ ] **Step 4: Run focused GREEN and existing interaction tests**

Run:

```bash
npm run build
npx playwright test tests/e2e/renewal.spec.ts --grep "brighter preview|visit flow changes|reduced motion|JavaScript-off|Kakao contact"
```

Expected: all selected tests pass, with no skipped tests or console errors.

- [ ] **Step 5: Commit the palette implementation**

```bash
git add app/globals.css components/CaseStudies.tsx components/VisitFlowSection.tsx tests/e2e/renewal.spec.ts
git commit -m "feat: add brighter comparison palette"
```

---

### Task 3: Verify and publish the second noindex preview

**Files:**
- Modify only if a verified regression requires a scoped fix: `app/globals.css`, `tests/e2e/renewal.spec.ts`

**Interfaces:**
- Consumes: completed brighter branch.
- Produces: a separate Cloudflare Pages preview and verification evidence.

- [ ] **Step 1: Run the full local verification**

Run:

```bash
npm run verify
npx tsc --noEmit
npm audit --omit=dev
git diff --check
```

Expected: lint/build pass, static `29/29`, Playwright at least `51/51`, typecheck clean, audit `0 vulnerabilities`, and no whitespace errors.

- [ ] **Step 2: Inspect responsive screenshots**

Capture and inspect `320×700`, `390×844`, `768×900`, and `1440×900`. Confirm no horizontal overflow, all CTA targets remain at least 44px, bright section headings and body copy are readable, photographs are not washed out, and the mobile sticky bar still yields to overlapping controls.

- [ ] **Step 3: Push only the comparison branch**

```bash
git push -u origin codex/brighter-preview
```

Wait for the GitHub Verify workflow to pass. Do not push `codex/trust-first-renewal` or `main`.

- [ ] **Step 4: Verify the Cloudflare branch preview**

Check the generated branch preview returns HTTP `200` with `X-Robots-Tag: noindex`, contains the brighter surface CSS, and still exposes the correct telephone/Kakao links. Confirm the original dark preview still returns `200` and retains the dark process/case palette.
