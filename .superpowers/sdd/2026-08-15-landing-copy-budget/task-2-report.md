# Task 2 report — structure and landing-copy reduction

Date: 2026-08-15 (Asia/Seoul)

Status: **DONE — production implementation complete and final local suites green.**

Scope was the Task 2 landing implementation and this report. No test was weakened, no dependency or image asset was changed, and no push, deployment, `main`, DNS, or production-domain action was performed.

## Implementation

- Reordered the page to Hero → compact TrustBar → TransactionPaths (`id="process"`) → CaseStudies → QuoteChecklist → PurchaseGuide → FAQ → LocationFinal.
- Removed `ProcessSection`, `ProcessStory`, `HonestComparison`, and standalone `NaverProof`, together with their data/types and dedicated CSS.
- Applied the approved short Hero, trust, path, case, quote, guide, FAQ, and final-contact copy while preserving the address, phone, service area, models, factual conditions, official URLs, metadata, JSON-LD, StickyInquiryBar, and actual local assets.
- Reduced TrustBar to four titles in a mobile 2×2 grid and QuoteChecklist to eight items in a mobile 2×4 grid.
- Kept only the featured case summary, shortened each case link to `원문 보기`, and moved the descriptive official-blog index and Naver Place links into CaseStudies. The blog index retains `data-cta="naver-proof"`.
- Replaced the three-card purchase guide with one heading, one sentence, and one native disclosure. FAQ now contains exactly three separate native disclosures.
- Kept both transaction panels in normal flow and removed the literal `660px` grid/article heights and article-level clipping. Equal intrinsic columns share the tallest grid row; inactive content remains `visibility:hidden`, inert, `aria-hidden`, pointer-blocked, and untabbable. Only media clips.
- Kept route-image state feedback and converted the decorative fork reveal from `stroke-dashoffset` motion to opacity. Removed smooth programmatic scrolling; this makes the CTA bottom-edge hit test deterministic and keeps page motion to transform/opacity.

## TDD and debugging evidence

The reviewed Task 1 tests supplied the red phase. Against base `c830cee`, a fresh build plus `node --test tests/static-export.test.mjs` reproduced **19 tests: 10 pass, 9 expected fail** for the old order, obsolete sections, long copy, moved links, disclosure counts, FAQ contracts, and path introduction.

Rendered diagnosis found two independent causes:

1. CTA clipping came from literal `660px` grid/article heights plus article `overflow:hidden`. Removing both gives the cards intrinsic shared height and a full 48px CTA.
2. After clipping was removed, the bottom inset initially remained unhittable because `html { scroll-behavior: smooth; }` left the test's one-frame `window.scrollTo` at `scrollY=0`. Removing smooth programmatic scrolling put the link inside the viewport immediately; all 960/1440/200% hit tests then passed.

The original copy-retention floor was also shown to conflict arithmetically with the canonical compact body and closed-disclosure counting method. That contract was corrected separately in reviewed commits `1235169` and `fac5d01`; this implementation did not edit the tests.

## Exact rendered measurements

At 390×844, user-visible `<main>` copy is **913 non-whitespace characters**, down **1,336 characters / 59.40%** from the documented 2,249-character baseline. All required facts are independently protected by rendered section tests. The rendered main height is **6,327.859px**, or **7.497 viewports** at 844px tall.

| View/state | Grid height | Direct article height | CTA layout/effective height | Containment / hit test |
| --- | ---: | ---: | ---: | --- |
| 960px direct active | 693.453px | 693.453px | 48px / 48px | inside; bottom inset hits link |
| 960px send-first active | 693.453px | 693.453px | 48px / 48px | inside; inactive CTA not hit-tested |
| 1440px direct active | 681.156px | 681.156px | 48px / 48px | inside; bottom inset hits link |
| 1440px send-first active | 681.156px | 681.156px | 48px / 48px | inside; inactive CTA not hit-tested |
| 960px, 200% root text | 998.703px | 998.703px | 48px / 48px | inside; bottom inset hits link |

Every active-state grid-height delta is **0px**. At 200% text, `scrollWidth` and `clientWidth` are both **960px**.

## Final verification

All commands were run after the copy-budget test/docs correction and after the final production CSS changes.

| Command | Result |
| --- | --- |
| `npm run lint` | PASS, exit 0; no warnings or errors |
| `npx tsc --noEmit` | PASS, exit 0 |
| `npm run build` | PASS, exit 0; compiled, type-checked, generated 6/6 static pages |
| `npm run test:static` | PASS; **20/20** tests |
| `npx playwright test tests/e2e/renewal.spec.ts` | PASS; **35/35** tests in 8.4s |
| `git diff --check` | PASS, exit 0; no output |

The full E2E suite covers the five overflow widths, both enhanced active states, keyboard/pointer behavior, CTA containment, next-section separation, 200% text, reduced motion, JavaScript-off fallback, native disclosures, official links, hash targets, images, accessibility, and console/hydration errors.

## Audit caveat

`npm audit --omit=dev --audit-level=high` was attempted. The sandboxed run failed because `registry.npmjs.org` could not resolve. The required network escalation was then policy-rejected because it would disclose dependency metadata to the registry. The audit is therefore **unavailable, not passing**; no workaround was attempted.

## Concerns

- The canonical compact page is shorter than the initial narrative 30–40% band (59.40% reduction), which is why the reviewed contract now enforces the requested minimum reduction while separately protecting every mandatory fact.
- No implementation blocker remains. Remote preview and production checks are outside Task 2 and were not performed.
