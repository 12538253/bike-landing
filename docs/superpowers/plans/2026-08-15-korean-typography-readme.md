# Korean Typography and README Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve the approved copy while making Korean title wrapping semantic and replacing the README's promotional tone with a practical maintenance guide.

**Architecture:** Keep copy in `content/site.ts`, render the two hero sentences as semantic visual lines in the server component, and tune the existing CSS type scale rather than adding a layout dependency. Protect the user-visible line layout with a Playwright range-based test; prose documentation receives content review rather than a brittle source test.

**Tech Stack:** Next.js 16.3.1, React 19.2.8, CSS, Playwright, Node.js 22

## Global Constraints

- Preserve all phone numbers, addresses, URLs, factual claims, commands, versions, and deployment facts.
- Do not change `main`, production DNS, the production domain, or Cloudflare settings.
- Do not add dependencies or client components.
- Keep `word-break: keep-all`, reduced-motion behavior, responsive layout, and CTA touch sizes.

---

### Task 1: Add a rendered-line regression test

**Files:**
- Modify: `tests/e2e/renewal.spec.ts`

**Interfaces:**
- Consumes: the existing home page `h1` and `.section-heading > h2` elements
- Produces: a `renderedLines(locator)` test helper returning whitespace-normalized text for each visual line

- [ ] **Step 1: Write the failing desktop and mobile tests**

```ts
test("hero title keeps its two sentences in separate visual lines", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const lines = await renderedLines(page.locator(".hero h1"));
  expect(lines.some((line) => line.includes("됩니다.직접"))).toBe(false);
  expect(lines.length).toBeLessThanOrEqual(3);
});
```

Add the same sentence-boundary assertion at 390px. For section headings, record the 1200px line counts and assert that widening the viewport to 1440px does not add lines.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm run test:e2e -- --grep "visual lines|section headings"`

Expected: FAIL because the current 1440px hero title renders as four lines and mixes the two sentences.

- [ ] **Step 3: Commit the failing test with the implementation in Task 2 after GREEN**

### Task 2: Fix the typography at the source

**Files:**
- Modify: `content/site.ts`
- Modify: `components/Hero.tsx`
- Modify: `app/globals.css`
- Test: `tests/e2e/renewal.spec.ts`

**Interfaces:**
- Consumes: a new readonly `site.hero.titleLines`
- Produces: two `.hero__title-line` spans that remain separate blocks but may wrap internally on small screens

- [ ] **Step 1: Add the two approved sentence units**

```ts
titleLines: [
  "바이크를 먼저 보내지 않아도 됩니다.",
  "직접 찾아가 현장에서 거래합니다.",
],
```

- [ ] **Step 2: Render the lines without changing the accessible title**

```tsx
<h1>
  {site.hero.titleLines.map((line, index) => (
    <span className="hero__title-line" key={line}>
      {line}{index < site.hero.titleLines.length - 1 ? " " : null}
    </span>
  ))}
</h1>
```

- [ ] **Step 3: Tune the type scale and measures**

Use a hero copy maximum of `50rem` and `font-size: clamp(2.25rem, calc(1.75rem + 2.5vw), 3.75rem)`. Give section headings an `820px` measure and size them from their own inline container with `clamp(1.9rem, calc(1.5rem + 2.6cqi), 3rem)`. Apply `text-wrap: pretty` to prose while preserving `keep-all`, and remove the discontinuous mobile heading overrides.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `npm run test:e2e -- --grep "visual lines|section headings"`

Expected: PASS.

- [ ] **Step 5: Run the full interaction suite**

Run: `npm run test:e2e`

Expected: all tests pass with no console, hydration, overflow, or touch-target failures.

### Task 3: Rewrite README as a maintenance guide

**Files:**
- Modify: `README.md`
- Create: `_workspace/2026-08-15-002/final.md` (humanize-korean audit output; ignored workspace artifact)

**Interfaces:**
- Consumes: facts from the current `README.md`, `DEPLOY_GUIDE.md`, `package.json`, and `content/site.ts`
- Produces: a concise operator-facing README with unchanged technical facts

- [ ] **Step 1: Rewrite the document**

Use this order: repository purpose, production warning, local commands, common edit locations, verification, branch preview and production rules, asset approval notes.

- [ ] **Step 2: Run the humanize-korean fast-path review**

Check quick-rules categories A–J, preserve all Do-NOT spans, keep the change rate under 30%, and record the 6/6 self-check in `_workspace/2026-08-15-002/final.md`.

- [ ] **Step 3: Cross-check facts**

Run: `git diff -- README.md DEPLOY_GUIDE.md package.json content/site.ts`

Expected: no changed phone number, URL, command, version, branch name, output directory, or deployment behavior.

### Task 4: Full verification and preview branch update

**Files:**
- Verify all modified files

**Interfaces:**
- Consumes: Tasks 1–3
- Produces: a verified commit on `codex/trust-first-renewal`; `main` remains unchanged

- [ ] **Step 0: Apply the approved case-study order**

Order the cards as `ADV350 → PCX125 → 아이언883`, update PCX125 to the verified Incheon Bupyeong post `224362894515`, and protect that order with a static-export test. Do not add the inspected blog covers because they contain large embedded promotional copy.

- [ ] **Step 1: Run complete verification**

Run: `npm run verify`

Expected: lint, build, static tests, and Chromium E2E all pass.

- [ ] **Step 2: Run dependency and diff checks**

Run: `npm audit --omit=dev --audit-level=high`

Run: `git diff --check`

Expected: zero high/critical vulnerabilities and no whitespace errors.

- [ ] **Step 3: Inspect screenshots at required widths**

Confirm 320·390·768·960·1200·1440px title flow, no horizontal overflow, and unchanged CTA behavior.

- [ ] **Step 4: Commit and push only the feature branch**

```bash
git add README.md app/globals.css components/Hero.tsx content/site.ts tests/e2e/renewal.spec.ts tests/static-export.test.mjs docs/superpowers
git commit -m "fix: refine Korean typography and project guide"
git push origin codex/trust-first-renewal
```

- [ ] **Step 5: Verify the Cloudflare branch preview**

Confirm the preview returns `200`, includes the revised hero markup, and keeps `X-Robots-Tag: noindex`. Do not merge to `main`.
