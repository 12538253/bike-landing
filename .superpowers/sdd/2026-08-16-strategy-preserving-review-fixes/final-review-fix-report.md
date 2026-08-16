# Final-review fix wave

Date: 2026-08-16 (Asia/Seoul)

Fix base: `9b7016d`

Branch: `codex/trust-first-renewal`

Push: not performed.

## Scope and root causes

1. Enhanced VisitFlow text resize
   - Root cause: at enhanced desktop widths, both detail panels were removed from normal layout by `position: absolute; bottom: 0`, while `.visit-flow__stages` only had a fixed `min-height: 364px`. Root text resizing enlarged the summaries and panels independently, but the panel height never participated in the grid's intrinsic block-size calculation. At 960px with a 200% root font size, the active panel physically overlapped the stage summaries.
   - Fix: the two summaries occupy row 1, and both detail panels occupy the same intrinsic row-2 grid area. The inactive panel remains hidden/inert but still contributes to track sizing, so the larger of the two panels is reserved and switching state cannot move the CTA or section. The old stage `min-height`/absolute positioning was removed rather than increased. The existing desktop emphasis, two-column summaries, active tint, opacity transition, and inactive semantics remain.
2. Hero process-link semantics
   - Root cause: visible copy said `진행 방법 보기`, while `aria-label` changed the accessible name to `신뢰 근거 보기` and `href` targeted `#trust`.
   - Fix: the link now targets `#process`; the conflicting `aria-label` was removed, so the visible label is also the accessible name.
3. Hero process-link target size
   - Root cause: `.hero__scroll` had no minimum block size or padding, so its visible desktop/tablet rectangle was only the text line height (18.71875px at 768px).
   - Fix: added a 44px intrinsic minimum height, centered flex alignment, and 8px inline padding. It remains separated from the fixed header, hero copy, and following trust section.
4. Forbidden marketing scanner
   - Root cause: the plan prohibited `전 기종`, but the static scanner regex did not include it.
   - Fix: added `전 기종` to the scanner and added a visible-copy fixture. Each prohibited fixture is now scanned in isolation, proving that another forbidden word cannot mask a missing regex alternative.

## TDD evidence

### RED

- `node --test --test-name-pattern='collects marketing terms' tests/static-export.test.mjs`
  - Failed as intended: `expected the forbidden-marketing scanner to reject 전 기종 in isolation`.
- `npx playwright test tests/e2e/renewal.spec.ts --grep 'hero process link exposes|visible hero process links|enhanced VisitFlow reserves' --workers=1`
  - Hero semantics failed because no link had accessible name `진행 방법 보기`.
  - Hero target failed at 768px: height `18.71875px`, below 44px.
  - After correcting a test-only `:scope` lookup error, VisitFlow failed for the intended production defect: `960px summary 1/panel overlap for 사진으로 먼저 안내`.

### GREEN

- Focused static scanner: 1/1 passed.
- Focused browser regressions: 3/3 passed.
  - Hero visible/accessibility name, `#process` destination, and settled hash target.
  - 44px target, keyboard focus, center hit test, and no header/hero-copy/trust overlap at 768, 960, and 1440px.
  - Enhanced VisitFlow at 960 and 1440px with `html { font-size: 200% }`, selecting both stages: active content rendered without clipping; summaries/panel/CTA did not overlap; panel remained within the stage grid; CTA remained within the flow; horizontal overflow was zero; flow height stayed stable between states.

## Final verification and metrics

| Check | Fresh result |
| --- | --- |
| `npm run verify` | exit 0: ESLint, production build, 28/28 static tests, 49/49 Chromium E2E tests |
| `npx tsc --noEmit` | exit 0 |
| `git diff --check` | exit 0 |
| `npm audit --omit=dev` | exit 0: 0 vulnerabilities |
| Lighthouse mobile | Performance 98, Accessibility 100, Best Practices 100, SEO 100 |
| Lighthouse details | FCP 0.8s, LCP 2.4s, TBT 20ms, CLS 0 |

The Lighthouse rerun used the fresh production static export at `http://127.0.0.1:4173`; its JSON output was kept in `/tmp/bike-landing-final-review-lighthouse.json`, not added to the repository.

## Previous ledger corrections

The earlier Task 4 ledger overstated its coverage and completion:

- `No Critical or Important finding remains` was not supportable. This final review reproduced four material gaps after that statement.
- Its 200% text-zoom evidence covered only the 390px static VisitFlow fallback plus one support disclosure. It did not exercise enhanced VisitFlow at 960/1440px, switch both stages, or compare summary/panel/CTA geometry.
- Its broad statement that the full E2E suite validated 44px actions did not cover the visible `.hero__scroll` target, which measured 18.71875px at 768px.
- The prior audit concern is now resolved by a fresh authorized `npm audit --omit=dev` run with zero vulnerabilities.

Those corrections are documentation-only; no unrelated production feature was added.

## Self-review

- Reviewed the complete `9b7016d..working-tree` diff and the final production/test changes line by line.
- The VisitFlow solution uses intrinsic grid sizing, not a larger fixed/minimum stage height. Both panels share one grid area so the larger state reserves space by construction.
- New browser assertions exercise real exported UI and real hit testing; no mocks or source-text-only CSS checks were added.
- The forbidden-term fixture tests the collector and scanner independently against each isolated term.
- Existing reduced-motion, coarse-pointer, JavaScript-off, sticky overlap, client-budget, mobile compactness, focus contrast, CTA destination, image, and console/hydration regressions all remain green in the full suite.
- Independent re-review confirmed that the three Important findings and scanner Minor are closed. Its only follow-up was to correct the stale `progress.md` ledger; that correction now explicitly supersedes the premature Task 4 review-clean, audit-blocked, and limited 200%-coverage entries.
- No production copy beyond the Hero anchor semantics changed. No analytics, dependencies, deployment, DNS, preview, main-branch, or push action was performed.

## Concerns

None found in the requested scope.
