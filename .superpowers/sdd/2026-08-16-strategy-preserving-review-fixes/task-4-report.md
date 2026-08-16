# Task 4 — Final local verification and release readiness

Date: 2026-08-16 (Asia/Seoul)
Start SHA: `f6f3c75`
Push: not performed (controller will run whole-branch review before any push).

## TDD record

- RED: `node --test tests/static-export.test.mjs` initially failed `renders the benefit-led hero and trackable contact links` because the final Kakao CTA did not render `data-cta` at all (25 pass, 1 fail).
- GREEN: `LocationFinal` now renders `data-cta={site.contact.finalKakao.ctaId}`. During the complete regression, duplicate `hero-kakao` IDs caused two existing locator contracts to fail. The final CTA now has the typed, unique `final-kakao` ID; `CtaId` was extended accordingly. Fresh verification is green.
- Added static export contract: the emitted `/images/og-bike-manager.jpg` must exist, be JPEG, be exactly 1200×630, be at most 180 KiB (the existing local-image budget), and be represented by the production canonical `https://www.bike-manager.com/...` Open Graph URL—not a preview or localhost origin.
- Added browser contract at 390×844 with a 200% root text scale: representative VisitFlow panel text and an opened support disclosure must remain rendered, not vertically clipped by scrolling/clipping ancestors, and not overlap fixed UI.

## Final verification

| Command / inspection | Exit / result |
| --- | --- |
| `npm run verify` | 0 — ESLint, production export, 27 static tests, and 46 Chromium E2E tests passed |
| `npx tsc --noEmit` | 0 |
| `git diff --check` | 0 |
| `npm audit --omit=dev` | Not run: platform escalation review rejected the command because audit would transmit dependency metadata to npm. No workaround attempted. |
| Lighthouse mobile, production static preview | 0 — Performance 98, Accessibility 100, Best Practices 100, SEO 100 |

Lighthouse detail: FCP 0.8 s, LCP 2.4 s, TBT 20 ms, CLS 0. Output: `task-4-lighthouse.json` in this directory.

## Browser and responsive checks

- Local production static server: `http://127.0.0.1:4173/` returned HTTP 200.
- Checked 320, 390, 768, 960, and 1440 px: no horizontal overflow; supported CTA destinations are present. Full E2E also validates 44 px actions, image loading, fixed/sticky hit testing, hash targets, keyboard/focus behavior, reduced-motion fallback, JavaScript-off fallback, and console/page/hydration errors.
- 200% text zoom: the new VisitFlow/support detail contract passes; existing intrinsic-layout contract also passes.
- Visual evidence captured after a 1.5 s animation settle: `task-4-390.png`, `task-4-1440.png` in this directory.

## Whole-branch self-review

- Reviewed all worktree changes against the start SHA. No Critical or Important finding remains.
- The only production change is a configured, unique tracking attribute for the final Kakao CTA; all other changes are regression contracts.
- No push, preview deployment, Cloudflare header check, production OG/Kakao cache check, DNS, apex redirect, or rollback action was performed. Those remain controller/post-approval operational work.

## Concerns

- `npm audit --omit=dev` still requires explicit authority to transmit dependency metadata to the npm registry; it is the sole incomplete requested verification.
