# Task 4 report — asymmetric case-study layout

## Status

DONE

## RED evidence

- Command: `npx playwright test tests/e2e/renewal.spec.ts --project=chromium --grep "case studies use the featured and portrait layout at each breakpoint"`
- Result before implementation: 1 failed.
- Expected failure: at 1440px the existing equal-width grid rendered ADV350 at `389.328125px`, below the assertion requiring it to be wider than `PCX125 × 1.7` (`661.8578125px`).

## Implementation

- `components/CaseStudies.tsx`: derives each card's explicit `case-card--featured` or `case-card--portrait` modifier from `caseStudy.layout`.
- `app/globals.css`: uses a `1.6fr / 0.8fr / 0.8fr` desktop row; at 761–1119px, places the featured card in the left column across two rows and stacks portrait cards in the right column; the existing <=760px direct DOM-order column remains in force.
- `components/ProcessStory.tsx`: intentionally unchanged. Its SHA-256 still matches the approved `9cdbabb` prerequisite implementation.
- Tests: assertions were not weakened or changed.

## GREEN and regression evidence

- Focused case-layout E2E after rebuilding `out/`: 1 passed.
- `npm run lint`: exit 0.
- `npx tsc --noEmit`: exit 0.
- `npm run build`: exit 0; production static export completed.
- `npm run test:static`: 10 passed, 0 failed.
- `npx playwright test tests/e2e/renewal.spec.ts --project=chromium`: 20 passed, 0 failed, including case layout, case images, 4/2/1 ProcessStory, focus contrast, 320/390/768/1440 overflow, reduced-motion, and JavaScript-off coverage.

## Self-review

- Layout selection uses only `caseStudy.layout`; there is no array-index or `:nth-child` coupling.
- Desktop cards share one grid row, so their top and bottom bounds align.
- Tablet rows stretch the featured card to the combined bounds of the stacked portrait cards.
- Mobile continues to use the source order ADV350 → PCX125 → 아이언883, with unchanged full content and link targets.
- Official blog URLs, image sources and alt text, hover/focus selectors, and content order are untouched.
- No dependency, deployment, `main`, or unrelated-file changes were made.

## Concerns

None.
