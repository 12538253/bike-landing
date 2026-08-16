# Strategy-preserving review fixes implementation plan

## Goal

Keep the approved blog/Daangn conversion strategy while correcting the review's real UX defects. The landing page must present Bike Manager as one direct-visit service, retain neutral pre-shipment safety advice as subordinate content, keep official-blog proof, and become shorter and clearer on mobile.

## Global constraints

- Work only on `codex/trust-first-renewal`. Do not change `main`, the production domain, Cloudflare DNS, or production deployment without explicit approval.
- Preserve these approved facts: `경력 10년 이상`, `24시간 문의 접수`, `인천·서울·경기 직접 방문`, qualified `스쿠터부터 대형 바이크까지`, onsite vehicle/final-price confirmation, and full payment confirmation before loading.
- `24시간` means inquiry reception only. Same-day or late visits are scheduled conditionally; never promise immediate dispatch.
- Preserve all three official-blog cases and their existing post links. Do not invent outcomes for PCX125 or Iron883.
- Keep the current watermarked official-blog photos only as compact proof thumbnails. Do not remove their watermark, hotlink Naver CDN assets, or present a photo as proof of a send-first incident.
- Do not add Daangn/Naver certification, fixed reviews, fake activity, `최고가`, `100%`, `즉시 출동`, `전 기종`, or other absolute claims.
- Preserve the petrol/ivory/brass/copper palette, static export, system fonts, no analytics, reduced-motion behavior, JS-off fallback, keyboard access, 44px touch targets, and page-specific client JS gzip budget of 35KB.
- Implement every behavior change with TDD: add or amend a real static/E2E test, observe the expected RED, then implement and observe GREEN.

## Task 1: Replace the competing route choice with one visit journey

1. Add failing static and Playwright contracts for the new visit journey before production changes.
2. Replace `TransactionPathKey`, `TransactionPath`, and the two-path content with:
   - `VisitStageKey = "photoGuide" | "onsiteDeal"`
   - `VisitStage` for the sequential stage content
   - `VisitFlowSection` containing the section copy, CTA, confirmation, and a `DisclosureCopy` safety note
3. Use this exact visible copy:
   - eyebrow: `사진 확인부터 현장 거래까지`
   - title: `바이크는 그대로 두고, 사진만 보내주세요.`
   - description: `바이크매니저가 약속한 장소로 직접 찾아갑니다.`
   - stage 01 title: `사진으로 먼저 안내`
   - stage 01 description: `기종·연식·주행거리·지역과 사진을 보내주시면 예상 견적과 방문 가능한 시간을 안내합니다.`
   - stage 01 facts: `예상 견적`, `방문 시간`
   - stage 02 title: `약속한 장소에서 함께 확인`
   - stage 02 description: `차량과 서류를 함께 확인하고, 최종 금액과 판매대금 전액 입금을 확인한 뒤 상차합니다.`
   - stage 02 facts in order: `차량 상태`, `최종 금액`, `전액 입금`, `상차`
   - confirmation: `입금 확인` / `확인 후 상차`
   - CTA: `사진 보내고 방문 일정 확인`, retaining `data-cta="method-kakao"`
   - safety summary: `차량을 보내는 거래라면 무엇을 확인해야 하나요?`
   - safety answer: `출발 전에 최종 금액과 감가 기준, 거래 중단 시 반환 조건, 왕복 운임 부담을 확인하세요. 바이크매니저는 약속한 장소로 직접 방문해 현장에서 거래합니다.`
4. Replace the branching SVG and equal service cards with a one-direction 01→02 progress line. On enhanced desktop, hover/focus/click changes the active stage and the connected detail panel without changing section height; stage 01 is the default. The CTA remains reachable and is not hidden inside an inactive panel.
5. On mobile, reduced motion, coarse pointer, and JS-off, render both stages in DOM order as static content. Render the safety advice as a neutral native `<details>` with no route number, image, CTA, branch color, or branded competing-service treatment.
6. Remove the two route photos from this section and update the client-boundary repository rule from `TransactionPaths` to `VisitFlow`.

## Task 2: Tighten the evidence, copy, and page structure

1. Add failing contracts for the revised copy, compact evidence cards, merged support section, order, and mobile footprint.
2. Hero exact copy:
   - keep eyebrow and current two-line H1
   - description: `사진으로 예상 견적과 방문 시간을 먼저 안내합니다. 약속한 장소에서 차량과 최종 금액을 함께 확인하고, 판매대금 전액 입금 후 상차합니다.`
   - note: `경력 10년 이상 · 입금 확인 후 상차`
   - scroll label: `진행 방법 보기`
3. Trust facts become: `24시간 문의 접수`, `인천·서울·경기 직접 방문`, `스쿠터부터 대형 바이크까지`, `공식 블로그 실제 사례`.
4. Header phone label becomes `전화 상담`; navigation label becomes `진행 방법`.
5. Case section exact direction:
   - title: `공식 블로그에 남긴 실제 매입 기록입니다.`
   - remove the duplicated description
   - ADV350 proof line: `늦은 저녁 자택 방문 · 현장 확인 후 대금 지급`
   - PCX125 and Iron883 show `공식 블로그 매입 기록`, not invented results
   - keep all three existing source URLs, the blog index link, and Naver Place link
   - replace full-card background treatment with separate compact thumbnails; mobile uses one featured ADV card and two smaller cards in a row when 320px content remains readable
6. Quote section keeps all eight information items. Replace `하자 부위` in the explanatory sentence with `확인이 필요한 부위`.
7. Merge PurchaseGuide and FAQ into one server-rendered support section with `id="faq"`:
   - title: `스쿠터부터 대형 바이크까지 상담합니다.`
   - description: `차량 상태와 등록 정보를 확인해 진행 가능 여부와 필요한 서류를 안내합니다.`
   - document summary: `명의·서류가 다른 경우`
   - document answer: `보통 신분증과 이륜자동차 사용신고필증 또는 폐지증명서를 확인합니다. 타인·법인·외국인 명의, 미성년자 소유, 서류 분실, 차대번호 훼손·재타각 차량은 현재 상태를 알려주시면 필요한 확인 사항과 서류를 안내합니다.`
   - FAQ 1 question: `최종 금액은 어떻게 정하나요?`
   - FAQ 1 answer: `사진으로 예상 금액을 먼저 안내합니다. 현장에서 차량과 서류를 함께 확인하고, 변동 사유와 최종 금액을 설명드린 뒤 동의하신 금액으로 거래합니다.`
   - FAQ 2 question: `방문 시간은 어떻게 정하나요?`
   - FAQ 2 answer: `문의는 24시간 접수합니다. 인천·서울·경기 지역과 당일 일정을 확인해 방문 가능한 시간을 안내하며, 늦은 시간도 일정에 맞춰 조율합니다.`
   - FAQ 3 question: `개인 거래와 업체 매입은 어떻게 다른가요?`
   - FAQ 3 answer: `일정 조율과 현장 처리를 한 번에 마치고 싶다면 업체 매입이 잘 맞습니다. 가격을 가장 우선한다면 개인 거래도 함께 비교해 보세요.`
8. In the final section, put the CTA before location information in DOM order. Use `사진 보내고 예상 견적 확인` and `전화로 차량 상담하기`.
9. Page order becomes Hero → Trust → Visit flow → Cases → Quote → Support → Final CTA/location.

## Task 3: Responsive and accessibility fixes

1. Add failing E2E regressions for the independently reproduced FAQ/sticky overlap, 768px navigation, footer type, focus appearance, and revised mobile section sizing.
2. Observe `#faq` in `StickyInquiryBar`. While the support/FAQ section intersects, hide the bar, apply `inert` and `aria-hidden`, and if focus is inside the bar transfer it to the labelled FAQ section with temporary `tabindex=-1` cleanup. Keep current process and final-section behavior.
3. Show navigation from 761px upward with responsive gaps/type; keep the header Kakao button hidden below 960px. Verify 761, 768, and 960px without overlap or overflow.
4. Raise footer small text to 13–14px with stronger contrast. Reduce its repeated contact sentence to `문의 010-7616-4949` while retaining the service and address.
5. Replace the visually heavy focus treatment with a 2–3px `:focus-visible` indicator that retains at least 3:1 contrast on every tested light and dark surface.
6. Do not use CSS fixed heights to hit content budgets. At 390×844 in the closed/default state, target `main` height ≤ 5,400px and the visit-flow section ≤ 1,000px while preserving intrinsic text expansion and 200% zoom behavior.
7. Confirm all visible action targets remain at least 44px and no sticky element covers content at 320, 390, 768, 960, or 1440px.

## Task 4: Final verification and preview release

1. Add/retain static checks that the exported OG image exists, is a valid 1200×630 JPEG within the existing image budget, and is referenced at the production canonical URL. Do not point preview metadata at the preview host.
2. Run fresh `npm run verify`, `npx tsc --noEmit`, `npm audit --omit=dev`, and `git diff --check`.
3. Run Lighthouse mobile against the production build. Acceptance: Accessibility, SEO, and Best Practices ≥95; Performance ≥85.
4. Inspect 320, 390, 768, 960, and 1440px screens plus 200% text zoom, reduced motion, JS-off, keyboard focus, hash navigation, console/page/hydration errors, image loading, and CTA destinations.
5. Perform a whole-branch code review and fix all Critical/Important findings, then re-run the complete verification.
6. Commit intentionally and push only `codex/trust-first-renewal`. Verify the Cloudflare preview returns 200, includes `X-Robots-Tag: noindex`, and serves every local case/OG asset.
7. Do not merge to `main`. Production OG/Kakao cache verification, apex→www 301, DNS, and rollback actions remain post-approval operational work.
