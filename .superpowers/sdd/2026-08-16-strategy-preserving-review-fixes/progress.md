# SDD ledger — plan: docs/superpowers/plans/2026-08-16-strategy-preserving-review-fixes.md

Baseline: `887b310`; static 25/25 and Chromium 43/43 pass. Sandbox port EPERM required the approved unsandboxed Playwright command.

Task 1: minor (deferred to Task 3): add a wide coarse-pointer static-fallback browser contract.
Task 1: complete (commits `887b310..3caf01e`, review clean; Critical 0, Important 0).
Task 2: minor (deferred to Task 3): compact case E2E should cover proof/link visibility in addition to link hit area.
Task 2: minor (deferred to final review): remove or correctly render the dead `finalKakao.ctaId` configuration.
Task 2: minor (deferred to Task 3): consolidate duplicate `.final-location` CSS rules while editing responsive styles.
Task 2: fix round 1/5 (1 addressed, 0 open — compact case source links now provide tested 44px hit areas; commit `41a13ff`).
Task 2: complete (commits `3caf01e..41a13ff`, review clean; Critical 0, Important 0).
Task 3: minor (deferred to Task 4): extend the 200% zoom test with representative vertical content containment/visibility.
Task 3: fix round 1/5 (3 addressed, 1 new open — nav 44px, VisitFlow cushion, geometry/hit tests fixed; new sticky focus regression; commits `f944685..eaffef3`).
Task 3: fix round 2/5 (1 addressed, 0 open — case-overlap focus transfer fixed; commit `f6f3c75`).
Task 3: complete (commits `41a13ff..f6f3c75`, review clean; Critical 0, Important 0).
Task 1 deferred minor resolved in Task 3: wide coarse-pointer VisitFlow fallback now has browser coverage.
Task 2 deferred compact-proof test minor resolved in Task 3.
Task 2 deferred duplicate `.final-location` CSS minor resolved in Task 3.
Task 4: minor (external pending): `npm audit --omit=dev` was policy-blocked because it transmits dependency metadata; `package.json` and lockfile are unchanged from the previously audited branch baseline.
Task 4: fix round 1/5 (2 Important and 1 adjacent Minor addressed, 0 open — full JPEG decode, honest target-self clipping regression, exact final CTA ID; commit `9b7016d`).
Task 4: complete (commits `f6f3c75..9b7016d`, review clean; Critical 0, Important 0; external audit concern recorded).
Task 2 deferred `finalKakao.ctaId` minor resolved in Task 4 with unique rendered `final-kakao` tracking.
Task 3 deferred 200% vertical containment minor resolved in Task 4.
Final review correction: the Task 4 `review clean; Important 0` closure above was premature. Whole-branch review subsequently found 3 Important issues (enhanced VisitFlow 200% overlap, Hero process-link destination/name mismatch, and the visible Hero link's undersized hit target) plus 1 Minor forbidden-scanner gap.
Final review correction: the earlier 200% closure only exercised the 390px static VisitFlow fallback and one support disclosure; it did not cover enhanced 960/1440px stage switching or summary/panel/CTA geometry.
Final review fix wave: all 3 Important issues and the scanner Minor are addressed with RED/GREEN regressions; independent re-review found no remaining code issue. Fresh `npm run verify` passed 28 static and 49 Chromium E2E tests.
Task 4 audit correction: fresh authorized `npm audit --omit=dev` completed with 0 vulnerabilities, so the policy-blocked audit concern is closed.
Local final-review fixes are complete in the final fix-wave commit. Push/Cloudflare preview verification remains open, and `main` must not be merged before that operational check.
