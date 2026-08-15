# 랜딩페이지 카피 감량 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development task-by-task, write failing tests first, and request review at each checkpoint.

**Goal:** 실제 사진과 두 갈래 거래 경로를 중심으로 기본 노출 문구를 30~40% 줄이고, 390px에서 10초 안에 업체·안심 근거·문의 방법을 이해하게 한다.

**Architecture:** 기존 TransactionPaths를 유일한 거래 절차 설명으로 삼는다. ProcessStory, HonestComparison, NaverProof 독립 섹션을 제거하고 고유 정보만 CaseStudies·TransactionPaths·LocationFinal로 옮긴다. `content/site.ts`는 보이는 문구와 FAQ의 단일 정보원이다. CSS는 compact mobile layout과 intrinsic transaction height를 담당한다.

**Reference:** `docs/superpowers/specs/2026-08-15-landing-copy-budget-design.md`

### Task 1: 카피 예산과 CTA containment RED 테스트

**Files:**
- Modify: `tests/static-export.test.mjs`
- Modify: `tests/e2e/renewal.spec.ts`

- [ ] 제거할 세 독립 섹션과 ProcessStory가 현재 존재해 실패하는 테스트를 작성한다.
- [ ] FAQ 3개, 이동한 블로그/플레이스 링크, 필수 사실 문자열, `#process` 목적지를 검사한다.
- [ ] 390px 기본 노출 카피가 baseline 대비 30~40% 줄었는지 브라우저에서 계산한다.
- [ ] 960·1440px 양쪽 활성 상태에서 CTA containment, 44px, 상태 불변 높이, 다음 섹션 비겹침을 검사한다.
- [ ] 200% 글자 크기와 320·390·768·960·1440px overflow를 검사한다.
- [ ] 구현 전 예상 RED를 기록한다.

### Task 2: 구조와 카피 감량 구현

**Files:**
- Modify: `app/page.tsx`
- Modify: `components/Header.tsx`
- Modify: `components/Hero.tsx`
- Modify: `components/TrustBar.tsx`
- Modify: `components/TradeMethodComparison.tsx`
- Modify: `components/TransactionPaths.tsx`
- Modify: `components/CaseStudies.tsx`
- Modify: `components/QuoteChecklist.tsx`
- Rewrite: `components/PurchaseGuide.tsx`
- Modify: `components/FAQSection.tsx`
- Modify: `components/LocationFinal.tsx`
- Delete: `components/ProcessSection.tsx`
- Delete: `components/ProcessStory.tsx`
- Delete: `components/HonestComparison.tsx`
- Delete: `components/NaverProof.tsx`
- Modify: `content/site.ts`
- Modify: `app/globals.css`

- [ ] 디자인 스펙의 최종 순서와 짧은 카피를 반영한다.
- [ ] ProcessStory, HonestComparison, NaverProof와 전용 CSS를 제거한다.
- [ ] 블로그/플레이스 링크를 CaseStudies와 LocationFinal로 옮긴다.
- [ ] 모바일 TrustBar 2×2, QuoteChecklist 2×4, 짧은 case cards를 구현한다.
- [ ] TransactionPaths의 literal 660px 높이를 제거하고 intrinsic shared height로 CTA 잘림을 해결한다.
- [ ] 모든 Task 1 테스트와 기존 회귀 테스트를 GREEN으로 만든다.

### Task 3: humanize-korean과 10초 화면 편집

**Files:**
- Modify: final Korean copy only when rule-backed
- Create: `_workspace/<run_id>/final.md`

- [ ] 5,000자 이하 최종 카피 묶음에 `humanize-korean` Fast Path를 적용한다.
- [ ] 고유명사·수치·사실을 보존하고 변경률 30% 이하, 자체검증 6/6을 통과한다.
- [ ] 390×844에서 첫 화면과 첫 스크롤을 시각 검수한다.
- [ ] 10초 후 업체, 안심 근거, 문의 방법을 답할 수 있는지 정보 위치를 확인한다.
- [ ] copy budget·모바일 길이·CTA containment를 다시 측정한다.

### Task 4: 전체 검증·독립 리뷰·미리보기

- [ ] lint, build, static, 전체 E2E, audit, diff check를 새로 실행한다.
- [ ] 320·390·768·960·1440px와 JS-off/reduced-motion/200% 글자 크기를 검증한다.
- [ ] 독립 whole-branch 리뷰의 Critical/Important를 해결하고 재검토한다.
- [ ] 기능 브랜치만 push한다.
- [ ] GitHub Verify, Cloudflare branch preview 200/noindex, 새 이미지 응답을 확인한다.
- [ ] `origin/main`, DNS, 운영 도메인은 변경하지 않는다.

