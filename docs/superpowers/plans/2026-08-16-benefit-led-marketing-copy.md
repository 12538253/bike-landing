# Benefit-Led Marketing Copy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 바이크매니저 랜딩페이지의 방어적인 문구를 장점 우선의 자신감 있는 마케팅 카피로 바꾸되, 견적·방문·입금·서류 관련 사실은 그대로 보존한다.

**Architecture:** 사용자 노출 카피는 기존 단일 정보원인 `content/site.ts`에서 관리한다. `components/Footer.tsx`의 연락 문구도 `site.footer`로 옮기고, 정적 export 및 Playwright 테스트가 새 카피·이전 문구 제거·모바일 줄바꿈을 검증한다.

**Tech Stack:** Next.js 16 정적 export, TypeScript, Node test runner, Playwright, humanize-korean Fast Path

## Global Constraints

- `main`, 운영 도메인, DNS는 변경하지 않는다.
- 전화번호·카카오·네이버·블로그 URL과 실제 사례 매핑은 변경하지 않는다.
- `최고가`, `무조건`, `100%`, `즉시 출동`, `모든 차량`은 사용하지 않는다.
- 사진 견적은 예상 금액이고 최종 금액은 현장에서 확인한다는 사실을 유지한다.
- 판매대금 전액 입금 확인 후 상차한다는 사실을 유지한다.
- 당일·야간 방문은 `일정에 맞춰 최대한 빠르게 조율`한다고 표현한다.
- 사용자 노출 한국어는 humanize-korean 변경률 30% 이하와 자체검증 6/6을 충족한다.

---

### Task 1: 장점 우선 카피 회귀 계약

**Files:**
- Modify: `tests/static-export.test.mjs`
- Modify: `tests/e2e/renewal.spec.ts`

**Interfaces:**
- Consumes: 정적 export `out/index.html`과 실제 브라우저 렌더링
- Produces: 새 전환형 카피 및 이전 방어형 카피 제거를 고정하는 테스트 계약

- [ ] **Step 1: 새 카피를 요구하는 정적 테스트를 작성한다**

  다음 정확 문구를 요구한다.

  - 히어로: `바이크는 그대로 두세요.`, `저희가 직접 찾아가 매입합니다.`
  - 거래 경로: `바이크는 그대로, 확인은 현장에서.`, `시간과 번거로운 절차를 줄여 현장에서 거래를 마칩니다.`
  - 견적 준비: `사진 몇 장과 기본 정보만 보내주세요.`
  - 사례: `말보다 실제 매입 기록으로 보여드립니다.`
  - 매입 범위: `스쿠터부터 대형 바이크까지 매입 상담합니다.`
  - FAQ: `당일이나 늦은 시간에도 방문할 수 있나요?`, `24시간 편하게 문의하세요. 인천·서울·경기 지역은 당일·야간 방문도 일정에 맞춰 최대한 빠르게 조율해드립니다.`
  - 최종 CTA: `예상 견적부터 방문 일정까지 빠르게 안내합니다.`

  다음 이전 문구는 export에 없어야 한다.

  - `최종 금액은 현장 상태에 따라 달라질 수 있습니다.`
  - `가격만 보면 개인 거래가 더 유리할 수 있습니다.`
  - `즉시 방문을 보장하지 않습니다.`
  - `거래가 어렵거나 서류를 더 준비해야 할 수 있습니다.`

- [ ] **Step 2: 정적 테스트가 의도한 이유로 실패하는지 확인한다**

  Run: `npm run build && npm run test:static`

  Expected: 기존 export에 새 카피가 없어서 FAIL하고, 빌드 자체는 성공한다.

- [ ] **Step 3: 390px 브라우저 계약을 새 카피로 갱신한다**

  FAQ 두 번째 항목과 히어로·거래 경로·최종 CTA의 정확 문구가 사용자에게 보이는지 검증한다. 히어로 두 줄은 각각 한 개의 시각적 줄을 유지하고, 390px 가로 넘침은 없어야 한다.

---

### Task 2: 전체 카피를 전환형으로 교체

**Files:**
- Modify: `content/site.ts`
- Modify: `components/Footer.tsx`
- Modify: `README.md`

**Interfaces:**
- Consumes: Task 1의 정확 카피 계약
- Produces: 메타·히어로·거래 경로·견적·사례·매입 범위·FAQ·최종 CTA·푸터의 장점 우선 카피

- [ ] **Step 1: `content/site.ts`를 최소 변경한다**

  - 메타 설명은 직접 방문, 빠른 안내, 입금 후 상차 순서로 쓴다.
  - 히어로 제목은 `바이크는 그대로 두세요.` / `저희가 직접 찾아가 매입합니다.`로 바꾼다.
  - 히어로 견적 주석은 `사진으로 예상 금액을 먼저 안내하고, 최종 금액은 현장에서 차량 상태를 함께 확인한 뒤 확정합니다.`로 바꾼다.
  - 거래 경로 note에서 개인 거래 가격 우위 문장을 제거한다.
  - 견적 준비 제목은 `사진 몇 장과 기본 정보만 보내주세요.`로 바꾼다.
  - 사례 제목은 `말보다 실제 매입 기록으로 보여드립니다.`로 바꾼다.
  - 매입 범위와 서류 안내는 진행 방법 중심으로 바꾼다.
  - FAQ 세 문항을 혜택형 질문과 두 문장 이하 답변으로 바꾼다.
  - `site.footer`에 서비스·연락 문구를 추가한다.

- [ ] **Step 2: 푸터와 README를 단일 정보원 및 새 톤에 맞춘다**

  `Footer.tsx`는 `site.footer`만 렌더링한다. README의 `24시간` 설명은 `문의는 언제든 가능하며 당일·야간 방문은 일정에 맞춰 조율한다`는 운영 의미로 바꾼다.

- [ ] **Step 3: 정적 테스트를 GREEN으로 만든다**

  Run: `npm run build && npm run test:static`

  Expected: 모든 정적 테스트 PASS.

---

### Task 3: 한국어 윤문과 전체 검증

**Files:**
- Create: `_workspace/2026-08-16-NNN/final.md` (gitignore 대상 윤문 산출물)
- Modify if required: `content/site.ts`, `README.md`, tests

**Interfaces:**
- Consumes: Task 2의 최종 사용자 노출 한국어
- Produces: 의미·수치·고유명사를 보존한 자연스러운 카피와 검증 증거

- [ ] **Step 1: humanize-korean Fast Path를 적용한다**

  5,000자 이하로 사용자 노출 카피를 모아 장르 `광고형 랜딩페이지`, 강도 `보수`로 윤문한다. 변경률 30% 이하, S1 0건, 자체검증 6/6만 반영한다.

- [ ] **Step 2: 전체 자동 검증을 실행한다**

  Run: `npm run verify`

  Expected: lint, static export build, 정적 테스트, Playwright 전체 PASS.

  Run: `npm audit --omit=dev`

  Expected: high·critical 0, 가능하면 전체 취약점 0.

- [ ] **Step 3: 390px와 1440px 화면을 확인한다**

  히어로 제목, 거래 경로 제목, FAQ 질문, 최종 CTA에 어색한 줄바꿈·가로 넘침·CTA 겹침이 없어야 한다. 390px에서 첫 화면만 보고 업체·직접 방문·입금 후 상차·카카오/전화 문의를 파악할 수 있어야 한다.

- [ ] **Step 4: 독립 리뷰 후 기능 브랜치만 push한다**

  Critical/Important 0을 확인한 뒤 `codex/trust-first-renewal`만 push한다. Cloudflare 미리보기의 200, `X-Robots-Tag: noindex`, 새 FAQ 문구를 확인한다. `main`은 변경하지 않는다.

