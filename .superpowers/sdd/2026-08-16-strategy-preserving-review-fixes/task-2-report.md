# Task 2 report — evidence, copy, and support compression

## RED

Command:

```sh
npm run test:static
```

Result: 17 passed, 9 failed. The intended failures covered the new trust/case/hero copy, absent `SupportSection`, retained duplicate case description, the separate three-detail FAQ, missing merged document disclosure, unchanged FAQ copy, and final CTA DOM/trackability contract.

## GREEN

Final command:

```sh
npm run verify
```

Result: exit 0. `eslint` passed, production static build passed, 26 static contracts passed, and 34 Chromium E2E contracts passed.

## Changes

- Moved the approved copy into `content/site.ts`: hero, trust, header/nav, quote, cases, support, and final CTA labels.
- Replaced the large, image-background case cards with compact proof cards that retain every existing local image and official-blog source URL. ADV350 uses the approved visit/payment line; PCX125 and Iron883 only claim an official-blog record.
- Replaced `PurchaseGuide` and `FAQSection` with one server-rendered `SupportSection` at `#faq`, containing the document disclosure followed by three native FAQ disclosures.
- Reordered final CTA markup before location markup while retaining the phone URL and its `final-phone` CTA identifier.
- Added static and E2E contracts for exact copy, source links, support merge/server boundary, four support disclosures, final DOM order, and the readable 320px one-featured-plus-two-card case layout.

## Self-review

- Confirmed `Hero → Trust → Visit flow → Cases → Quote → Support → Final CTA/location` from exported HTML.
- Confirmed all three case URLs, the blog-index link, the Naver Place link, and local WebP assets remain present.
- Confirmed no PCX125 or Iron883 outcome was introduced.
- Confirmed all client-boundary behavior in `VisitFlow` remains untouched; the support section has no client directive.
- Ran `git diff --check`; no whitespace errors.

## Concerns

None. The deferred coarse-pointer test was intentionally left to Task 3.

## Fix round 1 — compact case source-link touch target

### RED

Command:

```sh
npm run test:e2e -- --grep "compact case source links"
```

Result: 1 failed as intended. At 320px, the first compact case source link measured `18.109375px` high, below the 44px minimum.

### GREEN

Command:

```sh
npm run build && npm run test:e2e -- --grep "compact case source links" && npm run test:static
```

Result: exit 0. Production build passed, the focused four-width link-rect E2E contract passed, and 26 static contracts passed.

### Change

- Added a real-rendered E2E contract for all three compact case source links at 320, 390, 768, and 1440px. It checks a minimum 44px height and that each rect stays inside its compact card.
- Added `min-height: 44px` to the existing `.case-card__link` only. The standalone source link remains the only case link; no full-card image/advertising link was restored.

### Scope

- Deliberately did not address the three deferred Minor findings.
