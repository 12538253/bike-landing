# Task 1 report — copy budget and CTA containment RED tests

Date: 2026-08-15 (Asia/Seoul)

Status: **DONE — expected RED established against production base `3dccae3`.**

Scope was tests only. No production source, `main`, deployment, DNS, or remote state was changed.

## Test design

### Static export contract

`tests/static-export.test.mjs` now verifies the exported user-facing result rather than source text:

- `#process` is the single TransactionPaths section and the final section order is Hero → TrustBar → TransactionPaths → CaseStudies → QuoteChecklist → PurchaseGuide → FAQ → LocationFinal.
- `ProcessStory`/standalone process markup and heading, `HonestComparison`, and standalone `NaverProof` are absent.
- Approved Hero, compact TrustBar, two transaction paths, honest comparison note, case, quote checklist, purchase-guide, and final-location facts remain.
- Direct visit precedes send-first and the new short step groups/details are present in order.
- The official blog index and Naver Place links plus `data-cta="naver-proof"` are moved into CaseStudies; obsolete repeated case badges/link wording are absent.
- FAQ contains exactly three `<details>` with the approved questions. The fourth page-level `<details>` is the separate PurchaseGuide disclosure.
- Existing metadata, contact, image, case-source, JSON-LD, palette, and fabricated-proof regressions remain unchanged.

### Browser contract

`tests/e2e/renewal.spec.ts` now verifies:

- 390px user-visible copy is 60–70% of the fixed 2,249-character baseline (30–40% reduction).
- The counter excludes whitespace, SVG/picture text, `.sr-only`, `display:none`, `visibility:hidden`, `[aria-hidden=true]`, and closed-details content except the summary.
- The 390×844 first view exposes region/business, direct visit, photo inquiry, on-site/final amount, payment-before-loading, Kakao, and phone paths.
- Removed standalone sections are absent and `/#process` settles the TransactionPaths heading below the fixed header.
- At 960px and 1440px, hover/click/Enter/Space exercise both active states. Grid height delta must remain ≤1px.
- The direct CTA must be at least 44px tall, remain fully inside its article and every clipping ancestor in both active states, and hit-test to the link at its bottom inset when active.
- TransactionPaths must not overlap its following section, which must be CaseStudies.
- At 200% root text and 960px, the CTA must retain the same containment/hit-test guarantees with no horizontal overflow.
- The general overflow/action matrix now covers 320, 390, 768, **960**, and 1440px.
- Reduced-motion and JavaScript-off assertions retain both transaction details while asserting ProcessStory is absent; obsolete positive ProcessStory expectations were removed.

The geometry helper deliberately scrolls only `window`. Playwright's `scrollIntoViewIfNeeded()` can programmatically scroll an `overflow:hidden` article and conceal the exact clipping defect under test.

## Expected RED evidence

### Static

Command:

`node --test tests/static-export.test.mjs`

Result: **15 tests: 9 pass, 6 fail**, all behavior-contract failures:

1. `#process` does not identify TransactionPaths.
2. `data-testid="process-story"` is still exported.
3. The approved shorter Hero/fact copy is absent.
4. CaseStudies does not yet contain `data-cta="naver-proof"` or the moved index/Place destinations.
5. FAQ has **6** details instead of **3**, and there is not yet the separate PurchaseGuide details contract.
6. The new TransactionPaths introduction count is **0**, followed by the remaining new route-copy expectations once implementation advances.

No syntax, import, fixture, metadata, image, or dependency failure occurred.

### Focused browser structure/copy/hash/overflow

Command:

`npx playwright test tests/e2e/renewal.spec.ts --grep "removes standalone|visible copy|first view|transaction states|200% text|downstream hash|960px has"`

Observed behavior failures:

- ProcessStory count is **1**, expected 0.
- 390px visible `<main>` copy is **2,250**, expected at most **1,576**.
- `#process` resolves to the old warm ProcessSection and has no `data-testid="transaction-paths"`.
- The transaction successor is `#process`, expected `#cases`.

Result: **8 tests: 2 pass, 6 expected fail**. The six failures are removed-section structure, visible-copy budget, 960 containment/state order, 1440 containment/state order, 200% containment, and `#process` hash ownership.

The 390px first-view facts and the general 960px no-overflow/action test pass on the base implementation, proving those new tests are not failing from setup errors.

### Focused CTA geometry

Command:

`npx playwright test tests/e2e/renewal.spec.ts --grep "transaction states|200% text"`

Result: **3 tests, 3 expected failures**:

- 1440px direct active: effective CTA height **35.640625px**; clipping ancestor is the direct article; bottom inset hit test is false.
- 1440px send-first active (hover/click/Enter): effective direct CTA height remains in the observed clipped range **28.640625–35.640625px**; it remains outside the direct article.
- 960px direct active: CTA bottom inset hit test is false.
- 960px send-first active (hover/click/Enter): effective direct CTA height **0px**; the direct article clips it.
- 960px at 200% text: effective CTA height **0px**; both the direct article and the TransactionPaths section clip it; bottom inset hit test is false.
- No grid-height-delta assertion exceeded 1px, and no actual-next-section overlap assertion failed. This isolates the RED to old section placement and hard-height containment rather than unstable test timing.

These failures align with the prior Task 5 report's unmodified default-state measurements: 21.9px usable at 960px and 35.6px usable at 1440px inside the literal 660px article.

## Counting-method note

The browser counter measures `<main>` because the documented 2,249 baseline excludes header/footer chrome. Against base `3dccae3`, the independent counter returns **2,250**, a one-character difference from the documented measurement. The test therefore uses an explicit two-character methodology tolerance, producing an allowed final band of **1,348–1,576** characters. This tolerance is small enough not to weaken the approved 30–40% reduction.

## Verification hygiene

- `npx playwright test tests/e2e/renewal.spec.ts --list`: 25 tests discovered; no parse/config errors.
- `npx eslint tests/e2e/renewal.spec.ts tests/static-export.test.mjs`: pass.
- `git diff --check`: pass.

## Concerns

None blocking. The implementation task must rebuild `out/` before rerunning static tests, and should preserve the test's normal-flow/inactive-panel geometry rather than making the CTA pass through programmatic scrolling or relaxed clipping assertions.
