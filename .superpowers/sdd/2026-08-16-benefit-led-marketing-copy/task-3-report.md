# Task 3 Report — 한국어 윤문과 전체 검증

## Fast Path 자체검증

- 대상: `content/site.ts`의 사용자 노출 한국어, 광고형 랜딩페이지·보수 강도, 1,640자(5,000자 이하)
- 결과: S1 0건, 자체검증 6/6, 변경률 0.0%.
- 결정: 룰북에 근거한 윤문 대상이 없어 카피는 그대로 유지했다. 고유명사·수치·거래 사실도 모두 보존했다.
- 산출물: `_workspace/2026-08-16-001/final.md`

## 회귀 수정

- 390px에서 히어로의 두 번째 문장이 347px 컨테이너에서 423px가 필요해 두 줄로 분할됐다. 모바일(`<=760px`) 제목 크기만 `1.9rem`으로 조정해 한 시각적 줄에 맞췄다.
- 해시 대상 Playwright 테스트가 폐기된 거래 경로 제목을 하드코딩하고 있었다. 사용자 노출 카피는 변경하지 않고 현재 승인 계약인 `바이크는 그대로, 확인은 현장에서.`로 기대값만 갱신했다.

## 자동 검증

- `npm run verify`: PASS — lint, 정적 빌드, 정적 테스트 24/24, Playwright 40/40.
- `npm audit --omit=dev`: PASS — `found 0 vulnerabilities`.

## 화면 QA

- 390×844: 문서 폭 375px, `scrollWidth` 375px로 가로 넘침 없음. 히어로 두 문장은 각각 한 시각적 줄(265.9px, 345.6px)이며, 거래 경로 제목은 자연스러운 두 줄이다. FAQ 질문은 1·1·2줄로 읽히며 마지막 긴 질문만 자연스럽게 줄바꿈된다. 최종 CTA는 각각 347×56px, 사이 간격 12px이고 최종 섹션에서 sticky CTA 불투명도 0으로 겹치지 않는다.
- 1440×900: 문서 폭 1425px, `scrollWidth` 1425px로 가로 넘침 없음. 히어로 각 문장은 한 줄(488.5px, 635.0px), 거래 경로 제목과 FAQ 세 질문은 각 한 줄이다. 최종 CTA는 229×54px·172×54px이며 12px 간격으로 분리된다.
- 스크린샷: `_workspace/2026-08-16-001/qa-390.png`, `_workspace/2026-08-16-001/qa-390-final.png`, `_workspace/2026-08-16-001/qa-1440.png`

## 범위

요청대로 push와 Cloudflare 미리보기 확인은 수행하지 않았다.

## Review fix round 1 — 320px 제목 위계

- RED 명령: `npm run test:e2e -- --grep "320px keeps the hero title larger than section headings and readable"` — exit 1. 실제 측정값은 H1 `30.4px`, 거래 경로 H2 `31.748px`로 H1이 더 작아 계약에 실패했다.
- 최소 수정: `<=360px`에서만 `.hero h1`을 `2rem`으로 보정했다. 기존 `<=760px`의 `1.9rem`은 유지해 390px에서 승인된 두 문장이 각각 한 줄인 계약을 바꾸지 않았다.
- GREEN 명령: `npm run build && npm run test:e2e -- --grep "320px keeps the hero title larger than section headings and readable"` — exit 0, 1/1 PASS.
- 320×844 실화면: H1 `32px` > 거래 경로 H2 `31.358px`; 문서 `scrollWidth` 305px ≤ viewport 320px. 첫 문장은 1줄(279.9px), 둘째 문장은 2줄(136.4px·222.2px)이며 한 글자 고아 줄이 없다.
- 스크린샷: `_workspace/2026-08-16-001/qa-320.png`

## Review fix round 2 — 390px까지 위계 보장

- 폐기한 가설: `<=360px`의 H1 `2rem` 보정만으로 충분하다. 320px에서는 통과했지만, 390px RED에서 H1 `30.4px` < 거래 경로 H2 `33.412px`로 위계가 여전히 역전됐다. 이 전용 보정은 제거했다.
- 확장 RED 명령: `npm run test:e2e -- --grep "mobile keeps the hero title larger than section headings and readable"` — exit 1. 계약은 320·390 모두에서 H1 > 대표 H2, 가로 overflow 없음, 승인 문장 보존, 320 최대 2줄·390 각각 1줄·고아 한 글자 없음이다.
- Round 2 가설: `<=760px` H1을 `2.1rem`·`letter-spacing: -0.12em`으로 공통 적용했다. 390px 한 줄·위계 계약은 통과했지만, Round 3에서 한글 자간 품질 우려로 폐기했다.
- GREEN 명령: `npm run build && npm run test:e2e -- --grep "mobile keeps the hero title larger than section headings and readable"` — exit 0, 1/1 PASS.
- 320×844: H1 `33.6px` > H2 `31.358px`, 자간 `-4.032px`, `scrollWidth` 305px ≤ 320px. 첫 문장 1줄(261px), 둘째 문장 2줄(128px·208px), 고아 한 글자 없음.
- 390×844: H1 `33.6px` > H2 `33.022px`, 자간 `-4.032px`, `scrollWidth` 375px ≤ 390px. 승인 문장 두 개가 각각 1줄(261px·338.9px)이다.
- 스크린샷: `_workspace/2026-08-16-001/qa-320-round1.png`, `_workspace/2026-08-16-001/qa-390-round1.png`

## Review fix round 3 — 축약 카피와 자연스러운 자간

- 폐기한 가설: `2.1rem`·`-0.12em`. H1 `33.6px`와 자간 `-4.032px`은 기술 계약을 통과했지만, 한글 제목 글자가 약 4px씩 가까워져 시각 품질을 해칠 수 있다.
- 정확 카피 RED: 새 `직접 찾아가 매입합니다.`는 이전 문구의 부분 문자열이어서 포함 검사만으로는 구분되지 않았다. 이전 전체 문구 부재 계약을 추가한 뒤 `npm run test:static`은 exit 1로 정확히 RED가 됐다.
- 최종 수정: 승인 문구를 `저희가 직접 찾아가 매입합니다.`에서 `직접 찾아가 매입합니다.`로 축약하고, `<=760px` H1을 `2.2rem`·`letter-spacing: -0.04em`으로 적용했다. H1의 뜻·거래 사실은 바꾸지 않았다.
- GREEN 명령: `npm run build`, `npm run test:static`(24/24), `npm run test:e2e -- --grep "hero title keeps its two sentences in separate visual lines|mobile keeps the hero title larger than section headings and readable|390px visibly renders the approved hero facts and contact links"`(3/3).
- 최종 전체 검증: `npm run verify` — exit 0, lint·정적 빌드·정적 테스트 24/24·Playwright 41/41 PASS.
- 320×844: H1 `35.2px` > H2 `31.358px`, 자간 `-1.408px`, `scrollWidth` 305px ≤ 320px. 두 제목 모두 두 줄(116.2px·188px, 151px·153.1px)이며 고아 한 글자 줄이 없다.
- 390×844: H1 `35.2px` > H2 `33.022px`, 자간 `-1.408px`, `scrollWidth` 375px ≤ 390px. 두 승인 제목은 각각 한 줄(309.9px)이다.
- Fast Path 산출물: `_workspace/2026-08-16-001/final.md`는 새 승인 원문 1,636자·윤문 변경률 0.0%·S1 0건·자체검증 6/6으로 갱신했고, 승인 축약을 하이라이트에 기록했다.
- 스크린샷: `_workspace/2026-08-16-001/qa-320-round2.png`, `_workspace/2026-08-16-001/qa-390-round2.png`
