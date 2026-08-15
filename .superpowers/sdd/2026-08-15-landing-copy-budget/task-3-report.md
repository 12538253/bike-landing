# Task 3 report — humanize parity and rendered 10-second QA

Date: 2026-08-16 (Asia/Seoul)

Final reviewed HEAD: `b407eef15e8df351a897db6cf4a75b4a5de757ad`

Status: **PASS — no remaining Critical or Important rendered-copy issue.**

This task was primarily read-only rendered QA. The audit first reproduced two Important mobile defects on `a852447`: the direct path was below the `390 × 844` one-scroll frame, and three secondary links were shorter than 44px. The focused fix landed in `3d60339`; review then found the sticky inquiry bar covering all five steps at `scrollY=845`, and `b407eef` fixed that visibility boundary. This report verifies the final clean HEAD. No production or test file was edited by the Task 3 QA worker, and nothing was pushed.

## 10-second verdict

The settled exact `390 × 844` first view exposes all requested seller-decision facts:

- business and service area: `인천·서울·경기 중고 바이크 방문 매입`
- direct visit without prior shipping: `바이크를 먼저 보내실 필요 없습니다` and `약속한 장소로 찾아가`
- photo to estimate/time: `사진을 보내주시면 예상 견적과 방문 시간을 먼저 알려드립니다`
- onsite final amount: `현장에서 차량 상태와 최종 금액을 확인`
- payment before loading: `판매대금 전액이 입금된 것을 확인한 뒤 상차`
- Kakao photo CTA and phone path: both full buttons are above the fold
- provisional quote caveat: both sentences are fully visible

After exactly one viewport scroll (`scrollX=0`, `scrollY=844`), the transaction heading, direct-visit title, and all five steps fit without horizontal movement:

| Target | Final viewport rect |
| --- | --- |
| Transaction H2 | `x 14…376`, `y 245.711…323.227` |
| Direct title | `x 39…351`, `y 734.711…763.125` |
| Steps 1–4 | `y 785.125…802.750` |
| Step 5 (`상차`) | `y 810.750…828.375` |

The last step ends `15.625px` above the 844px boundary. The sticky bar is hidden and offscreen (`aria-hidden=true`, transformed box `y=860…920`) at both `scrollY=844` and `845`, and remains hidden at `1000` and `1400` while `#process` intersects. It becomes visible at the Quote checklist and is hidden again when the final CTA intersects. It therefore does not obscure the decision path.

Verdict: **PASS.** A first-time seller can identify the business, trust/transaction safeguards, and both inquiry paths in the first view; one scroll exposes the complete direct-visit path.

## Copy budget and humanize parity

At exact `390 × 844`, the browser visibility model counted **945 non-whitespace characters** in `<main>`. Closed disclosure answers, `.sr-only`, `display:none`, `visibility:hidden`, and `[aria-hidden=true]` content were excluded. This is **1,304 characters / 57.98% shorter** than the documented 2,249-character baseline.

- main height: `6,193.531px`
- main length: `7.338` viewports at 844px
- document width: `scrollWidth 390px`, `clientWidth 390px`

`_workspace/2026-08-15-003/final.md` is the current humanize artifact. Its body is **1,666 characters**, with the embedded audit recording **1,610 → 1,666**, **12.0% change**, grade **A**, and **6/6** self-check. The Task 3 brief's older `1,649 / 11.0%` note is stale; the file and Task 2 report agree on 1,666.

All 61 non-heading body lines are present in the rendered DOM except three intentional presentation transformations:

- the two route strings use SVG arrow icons, so their textual `→` separators are not DOM text;
- the eight quote items render as numbered grid cells, so the audit line's textual `·` separators are not DOM text.

Markdown audit headings such as `# 히어로` and `# 문의` are grouping labels, not required literal UI copy. Purchase-guide and FAQ answers remain in native closed `<details>` elements and are intentionally excluded from the default visible budget. Header/footer chrome adds brand, contact, address, and legal text outside the humanize body. The `HUMANIZE-SUMMARY` comment and its change-rate text are not rendered.

## Tap targets, overflow, and containment

At 390px, all **22** CSS-visible `a`, `button`, and `summary` elements were measured while the sticky bar was visible at Quote:

- minimum width/height requirement: **22/22 pass**
- minimum measured height: **44px**
- targets below 44px: **0**
- targets clipped by an overflow ancestor: **0**

The three pre-fix failures now measure:

| Target | Before | Final |
| --- | ---: | ---: |
| Header brand/home | `122.758 × 32px` | `122.758 × 44px` |
| Final map/review link | `184.852 × 19.672px` | `184.852 × 44px` |
| Final phone-number link | `144.781 × 26.398px` | `144.781 × 44px` |

The visible sticky bar is `366 × 60px`; each of its two links is `182 × 58px`. Its only geometric intersections in the tap audit are its own two child links. During the transaction section it is hidden, non-tabbable, and does not cover underlying content.

| CSS layout width | Height | `scrollWidth / clientWidth` | Main height / viewports | Direct CTA | Next section |
| ---: | ---: | ---: | ---: | --- | --- |
| 320 | 844 | `320 / 320` | `6,357.945px / 7.533` | `48px`, contained | clear |
| 390 | 844 | `390 / 390` | `6,193.531px / 7.338` | `48px`, contained | clear |
| 768 | 900 | `768 / 768` | `6,235.555px / 6.928` | `48px`, contained | clear |
| 960 | 900 | `960 / 960` | `5,775.313px / 6.417` | `48px`, contained | clear |
| 1440 | 900 | `1440 / 1440` | `5,920.516px / 6.578` | `48px`, contained | clear |

At 960px both route cards remain `447px` wide. At 1440px direct/send widths are `661.914 / 520.086px` (ratio `1.27270`, matching `1.12 / 0.88`) and reverse on send-first hover (`1.27274`). The grid-height delta is exactly `0px` at both widths (`693.938px` and `705.391px` respectively). The CTA is fully inside the direct article and clipping section at 960 and 1440.

## Pixel inspection

The 320 and 390 scroll sequences were inspected as actual pixels, along with 768, 960, and 1440 hero/process/case frames.

- Korean wrapping is balanced in the hero and section headings. At 320px, the process and purchase-guide headings use three deliberate lines; there is no one-character orphan. The send-first short path wraps to an additional row but stays readable.
- The compact TrustBar remains a readable 2×2 grid. QuoteChecklist remains a readable 2×4 grid.
- No oversized unexplained blank region or section overlap was found. The larger paper gaps around PurchaseGuide/FAQ are the intended 64px mobile section padding.
- Route and case canonical text remains readable over the dark overlays at 320/390/768/960/1440.
- Non-blocking asset caveat: the source photos contain large baked-in `010-7616-4949` / `중고오토바이매입` text. It repeats across cards and, in the 768/960 featured ADV crop, the phone text is clipped at the left edge and visually dominates the photo. The canonical card title, summary, and link remain readable, so this is a future asset-quality cleanup rather than a Critical/Important copy-budget defect.

## Screenshot evidence

Key final frames:

- `_workspace/2026-08-15-004/390-first-view-final.jpg`
- `_workspace/2026-08-15-004/390-plus-844-final.jpg`
- `_workspace/2026-08-15-004/390-scroll-845-final.jpg`
- `_workspace/2026-08-15-004/390-quote-sticky-final.jpg`

Full-page visual coverage is recorded as overlapping viewport sequences:

- 320px: `_workspace/2026-08-15-004/320-final-scroll-*.jpg`
- 390px: `_workspace/2026-08-15-004/390-final-scroll-*.jpg`

Breakpoint frames:

- `_workspace/2026-08-15-004/768-top.jpg`, `768-process.jpg`, `768-cases.jpg`, `768-cases-lower.jpg`
- `_workspace/2026-08-15-004/960-top.jpg`, `960-process.jpg`, `960-cases.jpg`, `960-cases-lower.jpg`
- `_workspace/2026-08-15-004/1440-top.jpg`, `1440-process.jpg`, `1440-cases.jpg`

Browser-capture caveat: the in-app browser reserves a 15px classic scrollbar, so the viewport override was set 15px wider and accepted only when `documentElement.clientWidth` equaled the requested CSS width. Its single-call `fullPage` capture tiled fixed elements and introduced blank bands under an overridden mobile viewport; `_workspace/2026-08-15-004/320-full-api-final.jpg` and `390-full-api-final.jpg` are retained only as capture diagnostics. The overlapping viewport sequences above are the reliable full-page pixel evidence. The screenshot canvas is 31px shorter than `window.innerHeight` because of in-app browser chrome; all pass/fail geometry comes from the exact DOM viewport.

## Fresh verification on final HEAD

| Check | Result |
| --- | --- |
| clean HEAD before QA | `b407eef15e8df351a897db6cf4a75b4a5de757ad`; clean |
| `npm run build` | PASS, exit 0; compiled, type-checked, generated 6/6 static pages |
| in-app rendered matrix | PASS at exact 320/390/768/960/1440 client widths |
| exact sticky states | PASS at 844/845/1000/1400, Quote, and final CTA |
| focused Playwright regressions | PASS, 3/3 (`one-viewport`, `process sticky suppression`, `44px secondary links`) |

No push, deployment, `main`, DNS, or production-domain action was performed.
