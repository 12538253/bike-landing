# 두 갈래 거래 경로 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Follow test-driven development and review every task before proceeding.

**Goal:** 기존 거래 방식 비교를 바이크매니저 고유의 두 갈래 거래 경로 인터랙션으로 교체하고, 실제 사례는 비대칭 편집 레이아웃으로 강화한다.

**Architecture:** `TradeMethodComparison`은 서버 섹션으로 유지하고 새 `TransactionPaths`만 작은 클라이언트 컴포넌트로 둔다. `ProcessStory`는 서버 정적 레일로 전환해 클라이언트 코드와 긴 스크롤을 제거한다. 문구·경로·CTA·사진·사례 레이아웃은 `content/site.ts`에서 관리한다.

**Tech Stack:** Next.js 16.3.1, React 19.2.8, TypeScript, CSS, Playwright, Sharp

## 전역 제약

- 디자인 스펙 `docs/superpowers/specs/2026-08-15-transaction-paths-design.md`를 따른다.
- BMW의 색·폰트·삼각 탭·그리드·비율·타이밍을 복제하지 않는다.
- 전달받은 한국어 문구의 의미와 사실을 바꾸지 않는다.
- 실제 공식 블로그 사진만 로컬 WebP로 사용하며 외부 CDN 핫링크를 금지한다.
- 모바일·reduced-motion·JS-off에서 모든 핵심 정보를 정적으로 표시한다.
- `main`, DNS, 운영 도메인을 변경하지 않고 `codex/trust-first-renewal` 미리보기만 갱신한다.

---

### Task 1: 새 동작을 보호하는 실패 테스트 작성

**Files:**
- Modify: `tests/static-export.test.mjs`
- Modify: `tests/e2e/renewal.spec.ts`

- [ ] 정적 HTML에서 새 제목·도입문·두 경로의 정확한 문구·`method-kakao`·직접 방문 우선 순서를 검사한다.
- [ ] 각 경로의 공식 로컬 이미지 경로와 800px/180KB 예산을 검사한다.
- [ ] 데스크톱 기본 직접 방문, hover 미리보기, pointer leave 복귀, click/키보드 고정, focus 우선 규칙을 검사한다.
- [ ] 선의 1회 진입 상태, reduced-motion 정적 상태, JS-off 양쪽 상세 노출을 검사한다.
- [ ] ProcessStory의 네 단계가 정적으로 모두 보이고 sticky/enhanced stage가 제거됐는지 검사한다.
- [ ] 1440·768·390px에서 사례 카드의 featured/portrait 배치를 bounding box로 검사한다.
- [ ] 구현 전 테스트가 기존 정적 비교 섹션 때문에 실패하는 RED를 확인하고 보고한다.

### Task 2: 콘텐츠 모델과 실제 경로 사진 추가

**Files:**
- Modify: `content/site.ts`
- Create: `public/images/routes/direct-visit.webp`
- Create: `public/images/routes/send-first.webp`

- [ ] `CtaId`에 `method-kakao`를 추가하고 하나의 `kakaoChatUrl` 상수를 모든 카카오 CTA가 재사용하게 한다.
- [ ] 키 기반 `TransactionPath` 타입과 `site.tradePaths.directVisit/sendFirst`를 추가한다.
- [ ] 문구·단계·확인 카드·CTA를 스펙 그대로 단일 정보원에 넣는다.
- [ ] ADV350 늦은 시간 상차 사진과 PCX125 측면 사진을 원본 비율 유지, 최장변 800px 이하, 각각 180KB 미만의 WebP로 변환하고 시각 검수한다.
- [ ] `CaseStudy`에 명시적 `layout: "featured" | "portrait"`를 추가한다.

### Task 3: 시그니처 TransactionPaths 구현

**Files:**
- Create: `components/TransactionPaths.tsx`
- Modify: `components/TradeMethodComparison.tsx`
- Modify: `app/globals.css`

- [ ] SSR 기본은 두 카드와 두 상세를 모두 노출한다.
- [ ] 데스크톱 fine-pointer·motion 허용 환경에서만 상호작용을 향상한다.
- [ ] 직접 방문 기본 활성, hover/focus 미리보기, leave/blur 복귀, click·Enter·Space 고정을 구현한다.
- [ ] `aria-expanded`, `aria-controls`, inactive panel의 접근성·포커스 차단을 일관되게 처리한다.
- [ ] 장식 SVG 경로가 섹션 진입 때 한 번만 그려지며 JS-off/reduced-motion에서는 완성 상태로 보이게 한다.
- [ ] 직접 방문 확인 카드와 `data-cta="method-kakao"` 실제 링크를 추가한다.
- [ ] 카드 높이를 예약하고 이미지 `scale(1.03)` 이하, 상세 `opacity/transform`, 폭 비율의 짧은 전환만 사용한다.

### Task 4: 사례 비대칭 레이아웃과 정적 4단계 정리

**Files:**
- Modify: `components/CaseStudies.tsx`
- Modify: `components/ProcessStory.tsx`
- Modify: `app/globals.css`
- Modify: affected tests from Task 1

- [ ] 사례 modifier를 content의 `layout` 값으로 부여한다.
- [ ] desktop `1.6/.8/.8`, tablet featured two-row + two stacked, mobile one-column 레이아웃을 구현한다.
- [ ] 기존 사례 링크·hover/focus·모바일 상세·이미지 alt를 보존한다.
- [ ] ProcessStory를 서버 컴포넌트의 4/2/1열 정적 번호 레일로 바꾸고 sticky stage·IntersectionObserver·긴 스크롤을 제거한다.
- [ ] 새 E2E와 기존 회귀 테스트를 함께 GREEN으로 만든다.

### Task 5: 전체 검증·미리보기 갱신

**Files:**
- Verify all modified/new files

- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `npm run test:static`
- [ ] `npm run test:e2e`
- [ ] `npm audit --omit=dev --audit-level=high`
- [ ] `git diff --check`
- [ ] 320·390·768·960·1440px 실제 화면에서 크롭·포커스·44px CTA·오버플로·레이아웃 이동을 확인한다.
- [ ] 새 페이지 전용 클라이언트 JavaScript gzip이 35KB 이하인지 확인한다.
- [ ] 독립 최종 리뷰 후 기능 브랜치만 push한다.
- [ ] GitHub Verify와 `https://codex-trust-first-renewal.bike-manager.pages.dev/`의 HTTP 200·noindex·새 이미지 응답을 확인한다.

