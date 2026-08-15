# Task 2 report — structure, canonical copy, and interaction review fix

Date: 2026-08-15 (Asia/Seoul)

Status: **DONE — production implementation and scoped review fix complete; final local suites green.**

Scope was Task 2 production code, the necessary regression tests, and this report. No dependency or image asset was changed, and no push, deployment, `main`, DNS, or production-domain action was performed.

## Implementation

- The landing order remains Hero → compact TrustBar → TransactionPaths (`id="process"`) → CaseStudies → QuoteChecklist → PurchaseGuide → FAQ → LocationFinal. The header now follows that order: `process`, `cases`, `faq`.
- Removed `ProcessSection`, `ProcessStory`, `HonestComparison`, and standalone `NaverProof`, together with their obsolete data/types and dedicated CSS.
- Applied the reviewed 1,666-character canonical body exactly, with the explicitly safer FAQ answer: `24시간은 문의 접수이며 즉시 방문을 보장하지 않습니다. 방문 시간은 지역과 당일 일정을 확인한 뒤 알려드립니다.` The hero includes `판매대금 전액`; FAQ 1 includes both vehicle/document inspection and seller consent.
- Centralized the canonical visible landing copy in typed `content/site.ts` structures. Header, Hero, TrustBar, TradeMethodComparison, CaseStudies, QuoteChecklist, PurchaseGuide, FAQSection, and LocationFinal render those values instead of duplicating canonical strings in components.
- Preserved the address, phone, service area, models, official URLs, metadata, JSON-LD, StickyInquiryBar, real local images, JavaScript-off fallback, native disclosures, and accessibility state.
- Official blog and Naver Place links remain inside CaseStudies. The blog index retains `data-cta="naver-proof"`.
- Transaction cards remain intrinsic and in normal flow. At 960px they stay equal; at 1200px and above on fine-pointer/no-reduced-motion devices, the active path receives `1.12fr` and the other `0.88fr`, reversed for send-first.
- A `26rem` prose measure keeps both desktop width states at the same intrinsic height without adding a fixed card height. Inactive content remains `visibility:hidden`, inert, `aria-hidden`, pointer-blocked, and untabbable; only media clips.
- Hash targets reserve one fractional-pixel safety allowance beyond the fixed 72px header, preventing a 71.5px landing caused by browser scroll rounding.

## TDD and debugging evidence

The review assertions were added before production changes.

- RED static run: **20 tests — 12 pass, 8 expected fail** for the canonical variants and single-source ownership.
- RED focused browser run: **12 tests — 2 pass, 10 expected fail**. Canonical sections were still old and both 1440px columns were equal (`1.0` instead of approximately `1.12 / 0.88`). Existing 960px equality and containment assertions remained green.
- The first GREEN attempt restored the width ratio but exposed a real **24.203px** grid-height shift. Browser measurements isolated it to the direct-path description changing from one line at 579.906px to two lines at 438.078px.
- Constraining desktop panel prose to the narrower readable line measure made both states wrap identically while preserving intrinsic normal flow. The focused interaction regressions then passed **2/2** with a **0px** height delta.
- A full-suite run then exposed fractional hash rounding at FAQ (`71.5px` against a 72px header). The existing regression supplied RED; adding 1px to `scroll-margin-top` produced final measured tops of process **73px**, FAQ **72.5px**, and contact **82.5px**.

## Exact rendered measurements

At 390×844, user-visible `<main>` copy is **945 non-whitespace characters**, down **1,304 characters / 57.98%** from the documented 2,249-character baseline. Closed disclosure answers and hidden inactive-path text follow the same browser visibility model as the budget test. The rendered main height is **6,327.859px**, or **7.497 viewports** at 844px tall.

| View/state | Direct / send widths | Emphasis ratio | Grid height | CTA layout / effective height | Containment / hit test |
| --- | ---: | ---: | ---: | ---: | --- |
| 960px direct active | 447px / 447px | 1.000 | 693.453px | 48px / 48px | no clipping; bottom inset hits link |
| 960px send-first active | 447px / 447px | 1.000 | 693.453px | 48px / 48px | no clipping; inactive CTA unavailable |
| 1440px direct active | 661.906px / 520.094px | 1.272667 | 705.359px | 48px / 48px | no clipping; bottom inset hits link |
| 1440px send-first active | 520.078px / 661.922px | 1.272735 reversed | 705.359px | 48px / 48px | no clipping; inactive CTA unavailable |
| 960px, 200% root text | 447px / 447px | 1.000 | 998.703px | 48px / 48px | no clipping; bottom inset hits link |

Every pointer, click, Space, and Enter active-state grid-height delta is **0px**. At 200% text, `scrollWidth` and `clientWidth` are both **960px**. The normal-size CTA is 202.813px wide; at 200% text it is 340.188px wide.

## Final verification

All commands below were run after the final production and test changes.

| Command | Result |
| --- | --- |
| `npm run lint` | PASS, exit 0; no warnings or errors |
| `npx tsc --noEmit` | PASS, exit 0 |
| `npm run build` | PASS, exit 0; compiled, type-checked, generated 6/6 static pages |
| `npm run test:static` | PASS; **21/21** tests |
| `npx playwright test tests/e2e/renewal.spec.ts` | PASS; **35/35** tests in 9.7s |
| `npm test` | PASS; **21/21 static/client-budget + 35/35 browser tests** |
| `git diff --check` | PASS, exit 0; no output |

The browser suite covers exact canonical copy, typed source ownership, all five overflow widths, both enhanced active states, the desktop width reversal, keyboard/pointer behavior, CTA containment, next-section separation, 200% text, reduced motion, JavaScript-off fallback, native disclosures, official links, hash targets, images, accessibility, and console/hydration errors.

## Audit caveat

`npm audit --omit=dev --audit-level=high` was attempted after the final implementation. The sandboxed run failed with `getaddrinfo ENOTFOUND registry.npmjs.org`. The required network escalation was policy-rejected because the audit would disclose dependency metadata to the registry. The audit is therefore **unavailable, not passing**; no workaround was attempted.

## Concerns

- The canonical compact page is shorter than the initial narrative 30–40% band (**57.98% reduction**). The reviewed contract intentionally enforces the requested minimum reduction while protecting every mandatory fact and exact canonical variant separately.
- No implementation blocker remains. Remote preview and production checks are outside Task 2 and were not performed.
