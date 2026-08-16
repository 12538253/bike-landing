# Task 3 report — responsive and accessibility fixes

## Scope delivered

- `StickyInquiryBar` now observes `#faq`.  When FAQ is intersecting, the bar is visually hidden, inert, and `aria-hidden`; keyboard focus moves from the bar to the FAQ section (`aria-labelledby="faq-title"`) using a temporary `tabindex=-1`, which is removed on blur.  The existing final-section handoff still works after an intermediate FAQ handoff.
- Navigation is visible from 761px up.  Its tablet spacing/type scale down through 1100px; the header Kakao action remains hidden below 960px.
- Footer contact is `문의 010-7616-4949`; footer supporting type is 13px with stronger contrast.
- Focus appearance is a 2px white outline plus 2px ink contrast ring, replacing the previous 7px shadow.
- Mobile layout uses smaller intrinsic padding/margins only (no fixed-height cap).  Adjacent duplicate `.final-location` declarations were merged.

## TDD evidence

### RED

Command:

```sh
npm run build && npx playwright test tests/e2e/renewal.spec.ts --grep 'sticky inquiry yields|761px through|footer small type|focus indicator is a 2|390px default main|wide coarse'
```

Initial browser run against `41a13ff` exposed the intended regressions:

- FAQ scroll left `.sticky-inquiry` visible and non-inert (`aria-hidden="false"`), where the new FAQ handoff expected it inert.
- 761/768px navigation had no layout box because the `max-width: 1100px` rule set it to `display: none`.
- Footer retained the old repeated contact sentence and 11.52px (`0.72rem`) supporting type.
- At 390px, `VisitFlow` measured `1005.578125px`, over the 1000px budget.

The wide coarse-pointer fallback was already correct and its new regression passed before changes.  The focused indicator was strengthened to reject the existing 7px shadow and then verified with the final 2px ring contract.

### GREEN

Targeted command:

```sh
npm run build && npx playwright test tests/e2e/renewal.spec.ts --grep 'mobile inquiry bar appears|sticky inquiry becomes inert|sticky inquiry yields|761px through|footer small type|focus indicator is a 2|390px default main|wide coarse' --workers=1
```

Output: `8 passed`.

Extra review regressions:

```sh
npx playwright test tests/e2e/renewal.spec.ts --grep 'compact case proof|200% text zoom' --workers=1
```

Output: `2 passed`.

## Browser metrics

Measured in Chromium at 390×844 after the production build:

| Metric | Result | Requirement |
| --- | ---: | ---: |
| `main` height (default/closed) | 5048.75px | ≤5400px |
| `VisitFlow` height | 999.578125px | ≤1000px |
| Footer supporting type | 13px | 13–14px |
| Document width | 390px | no horizontal overflow |

The E2E suite additionally checks 320/390/768/960/1440 action sizes/overflow, 761/768/960 header geometry, focus contrast ≥3:1 against the approved paper and ink surfaces, 320/390 compact proof/link clipping/readability, and 200% text zoom.

## Final verification

```sh
npm run verify
```

Output: ESLint passed; static export tests `26/26` passed; Playwright E2E tests `43/43` passed.

## Self-review

- No fixed CSS heights were added for content budgets; mobile reductions are padding/margin only and text remains intrinsic.
- The focus handoff only occurs when the active element is in the sticky bar (or the FAQ temporary destination when handing off to final CTA), so ordinary FAQ scrolling does not steal focus.
- `git diff --check` passed.

## Round 1 — touch targets, layout margin, and overlay audit

### RED

```sh
npm run build && npx playwright test tests/e2e/renewal.spec.ts --grep '761px through|390px default main|fixed header and mobile sticky' --workers=1
```

Output: `3 failed` as intended.

- At 761px the smallest navigation link measured `43.140625px` wide (and had no 44px height contract).
- `VisitFlow` still measured `999.578125px`, failing the strengthened `≤985px` contract.
- At 320px the visible sticky inquiry covered `공식 블로그에서 더 많은 사례 보기` in the actual rectangle-overlap audit.

### GREEN

```sh
npm run build && npx playwright test tests/e2e/renewal.spec.ts --grep 'mobile inquiry bar appears|sticky inquiry becomes inert|sticky inquiry yields|761px through|390px default main|fixed header and mobile sticky' --workers=1
```

Output: `6 passed`.

- Each visible navigation link is now an inline-flex 44×44px target at 761/768/960/1440px.  The browser regression also asserts ordered, pairwise non-overlapping brand → navigation → header-actions rectangles at 761/768/960px.
- Mobile VisitFlow uses 17px stage-panel end padding and 18px safety-note margin.  At 390×844 it now measures `981.578125px`, leaving `18.421875px` below the 1000px original budget and passing the ≤985px regression; `main` measures `5030.75px`.
- Sticky visibility now checks case-action rectangles against the bar's actual fixed viewport slot on scroll/resize.  It hides only while a case action would overlap that slot, preserving a usable sticky bar in safe scroll positions.  The five-width audit uses center `elementFromPoint` checks for visible actions and confirms no visible non-sticky action intersects the bar at the case section.

### Round 1 final verification

```sh
npm run verify
```

Output: ESLint passed; static export tests `26/26` passed; Playwright E2E tests `44/44` passed.
