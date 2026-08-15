# Case Study Blog Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the three repeated case-card placeholders with verified local WebP images from each matching official blog post.

**Architecture:** Keep the existing `CaseStudies` server component and `CaseStudy` content model. Store optimized files under `public/images/cases/`, point `content/site.ts` at those files, and protect the user-visible result through static-export and browser image-loading tests.

**Tech Stack:** Next.js 16.3.1, React 19.2.8, Sharp, Playwright, Node.js 22

## Global Constraints

- Keep the order `ADV350 → PCX125 → 아이언883`.
- Use only matching photos from official blog posts `224355424035`, `224362894515`, and `224351926598`.
- Keep every local case image at 800×600 and below 180KB.
- Do not hotlink Naver CDN URLs or generate/reshape the bikes.
- Preserve current case-card links, copy, keyboard access, hover behavior, and responsive layout.
- Push only `codex/trust-first-renewal`; do not change `main`, DNS, or production settings.

---

### Task 1: Protect distinct local case images

**Files:**
- Modify: `tests/static-export.test.mjs`
- Modify: `tests/e2e/renewal.spec.ts`

**Interfaces:**
- Consumes: the exported `#cases` section and `.case-card__media img` elements
- Produces: regression coverage for three unique local images and successful browser decoding

- [ ] **Step 1: Write the failing static test**

Assert that the cases section contains `/images/cases/adv350.webp`, `/images/cases/pcx125.webp`, and `/images/cases/iron883.webp`, that each path appears, and that it contains no `pstatic.net` image source.

- [ ] **Step 2: Write the failing browser test**

Load the page at 1440px, collect the three `.case-card__media img` elements, assert the resolved `src` values are unique, and assert each image has `complete === true` and `naturalWidth > 0`.

- [ ] **Step 3: Verify RED**

Run `npm run build && npm run test:static`, then run `npm run test:e2e -- --grep "case cards load"`.

Expected: both new tests fail because all three cards still use `/images/hero-bg.webp`.

### Task 2: Add and wire the optimized photos

**Files:**
- Create: `public/images/cases/adv350.webp`
- Create: `public/images/cases/pcx125.webp`
- Create: `public/images/cases/iron883.webp`
- Modify: `content/site.ts`
- Modify: `components/CaseStudies.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: the three approved official-blog representative JPEGs
- Produces: three 800×600 local WebP files referenced by `site.cases`

- [ ] **Step 1: Convert the selected photos**

Use Sharp with `resize(800, 600, { fit: "cover" })` and `webp({ quality: 76, effort: 6 })`. Inspect the result and lower quality only if a file exceeds 180KB.

- [ ] **Step 2: Update the single content source**

Set the three `image` values to their matching `/images/cases/*.webp` paths, replace the placeholder alt text with a factual description of the visible bike, and tune each `imagePosition` after visual inspection.

- [ ] **Step 3: Update the card disclosure**

Replace the existing-placeholder sentence with: `카드 이미지는 공식 블로그에 게시된 실제 매입 사진입니다. 카드를 누르면 당시 기록을 확인할 수 있습니다.`

- [ ] **Step 4: Tune the image filter**

Keep the existing gradient and transform-only hover. Increase image saturation and brightness only enough for each bike to remain recognizable behind the card copy.

- [ ] **Step 5: Verify GREEN**

Run the focused static and browser tests. Expected: all pass, with three unique decoded local images and no Naver CDN URL in exported HTML.

### Task 3: Full verification and preview update

**Files:**
- Verify all modified and new files

**Interfaces:**
- Consumes: Tasks 1–2
- Produces: a verified feature-branch preview with `main` unchanged

- [ ] **Step 1: Run full verification**

Run `npm run lint`, `npm run build`, `npm run test:static`, `npm run test:e2e`, `npm audit --omit=dev --audit-level=high`, and `git diff --check`.

- [ ] **Step 2: Inspect required viewports**

Confirm actual image crops, text contrast, hover zoom, and zero horizontal overflow at 320·390·768·1440px.

- [ ] **Step 3: Commit and push the feature branch**

Stage only the case-image implementation, tests, and these design documents. Commit with `feat: use official blog photos for case cards` and push `codex/trust-first-renewal`.

- [ ] **Step 4: Verify the deployed preview**

Confirm HTTP 200, `X-Robots-Tag: noindex`, three distinct `/images/cases/*.webp` files, and successful GitHub Verify. Do not merge to `main`.
