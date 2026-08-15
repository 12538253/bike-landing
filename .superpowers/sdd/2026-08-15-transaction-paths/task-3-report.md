# Task 3 report — TransactionPaths interaction

## Implemented

- Replaced the old comparison UI with a server-rendered `TradeMethodComparison` section carrying `data-testid="transaction-paths"` and consuming the approved section copy from `content/site.ts`.
- Added a small client `TransactionPaths` child that renders the keyed `directVisit` path before `sendFirst`, including both route images, ordered steps, descriptions, the direct-visit confirmation card, and the real `method-kakao` link from the content single source of truth.
- Kept progressive fallback semantics: SSR, JavaScript-off, reduced motion, non-fine-pointer, and widths below 960px expose both detail panels and a completed decorative fork line.
- Added the desktop-only enhancement for fine hover pointers with motion allowed: direct visit is initially pinned; focus overrides hover preview; pointer leave and focus exit fall back through the keyed preview/focus state to the pinned path; native button click, Space, and Enter pin a path.
- Kept `aria-expanded` and `aria-controls` synchronized. Inactive enhanced panels are `inert`, `aria-hidden`, visually hidden, pointer-blocked, and their CTA is removed from sequential focus. The active CTA remains a real 48px-high link directly after its controlling button in tab order.
- Added the decorative, `aria-hidden` fork SVG. Its server state is complete; after hydration it is reset only when motion is allowed, and a component-scoped one-shot `IntersectionObserver` reveals it on first intersection.
- Added method-scoped responsive CSS using the approved petrol, ivory, brass, copper, and steel palette. Enhanced desktop cards reserve a fixed 660px grid/card height, switch only between keyed 1.12/0.88 ratios, cap active image scaling at 1.03, and use short width/image/detail transitions.

## TDD evidence

### RED

Command before implementation:

```sh
npm run build && npm run test:static
```

Result: build passed; static tests reported 9 passing and 1 expected failure:

```text
not ok 5 - exports the two transaction paths with local, budgeted route images
error: expected the transaction paths section
```

The failure was expected because the old comparison section did not render `data-testid="transaction-paths"` or the new path content.

### GREEN

Commands after implementation:

```sh
npm run lint
npx tsc --noEmit
npm run build
npm run test:static
git diff --check
```

All exited 0. The static suite reported 10/10 passing and the client JavaScript budget test remained green.

Focused interaction/fallback command:

```sh
npx playwright test tests/e2e/renewal.spec.ts --workers=1 --grep 'desktop transaction paths|disables entrance|JavaScript-off desktop|320px has no horizontal'
```

Result: 4/4 passing in Chromium:

```text
desktop transaction paths preview, pin, and prioritize keyboard focus — passed
reduced motion › disables entrance and scroll-linked animation — passed
JavaScript-off desktop falls back to four static process cards — passed
320px has no horizontal overflow or undersized primary actions — passed
```

The Playwright preview server required permission to bind `127.0.0.1:4173`; the authorized rerun passed. The unrelated Task 4 case-layout E2E was deliberately not included in the focused Task 3 command.

An implementation-only temporary QA test also exercised the narrowest fallback at 320px with JavaScript disabled. Its first run correctly failed because the new grid had not been added to the mobile one-column selector (`x` difference: 158px). After adding that selector and rebuilding the static export, the same test passed: both articles shared the same x-position in direct-first vertical order, both detail panels were visible, the fork was complete, and document width did not exceed 320px. The temporary QA file was removed after the RED/GREEN check and is not part of the commit.

## Files changed

- `components/TransactionPaths.tsx`
- `components/TradeMethodComparison.tsx`
- `app/globals.css`
- `.superpowers/sdd/2026-08-15-transaction-paths/task-3-report.md`

## Self-review

- Verified the enhanced-mode media query exactly gates on 960px minimum width, hover support, fine pointer, and no reduced-motion preference.
- Verified the 320px JavaScript-off fallback is a direct-first one-column layout with both details, completed fork, and no horizontal overflow.
- Verified state and styling use path keys rather than array indexes or CSS positional selectors.
- Verified no GSAP, WebGL, scroll control, autoplay/carousel behavior, new dependency, or Task 4 CaseStudies/ProcessStory change was introduced.
- Verified the server HTML contains both panels and a completed line, while enhanced inactive content is focus-blocked without nesting the CTA inside a button.
- No remaining Task 3 concerns found.
