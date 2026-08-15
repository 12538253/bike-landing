# Cloudflare Pages 배포·복구 가이드

## 현재 연결 정보

- GitHub 저장소: `12538253/bike-landing`
- Cloudflare Pages 프로젝트: `bike-manager`
- production 브랜치: `main`
- 빌드 명령: `npm run build`
- 출력 디렉터리: `out`
- 기준 도메인: `https://www.bike-manager.com`

`main`에 push하면 Cloudflare Pages가 운영 사이트를 자동 배포합니다. 따라서 검토 전 작업을 `main`에 직접 push하지 않습니다.

## 안전한 변경 순서

1. `codex/` 접두사의 작업 브랜치를 만듭니다.
2. 로컬에서 `npm run verify`와 `npm audit --omit=dev`를 통과시킵니다.
3. 작업 브랜치만 push합니다.
4. Cloudflare Pages의 브랜치 미리보기 주소와 `X-Robots-Tag: noindex`를 확인합니다.
5. 전화·카카오톡 링크, 320·390·768·1440px 화면을 점검합니다.
6. 업체 승인을 받은 뒤에만 pull request를 `main`에 병합합니다.
7. 운영 도메인의 HTTP 상태와 주요 CTA를 다시 확인합니다.

## 운영에서 변경하지 않는 항목

미리보기 승인 전에는 아래 설정을 수정하지 않습니다.

- Cloudflare DNS와 custom domain
- 도메인 등록·결제·자동 갱신
- Pages production branch
- `main` 브랜치

## 장애 복구

운영 반영 뒤 문제가 생기면 Cloudflare Pages에서 이전 성공 배포 `d36c2e5`를 우선 롤백합니다. 이어서 Git에서 리뉴얼 병합 커밋을 `revert`하고 검증한 뒤 `main`에 push합니다. 이 과정에서 DNS를 바꾸거나 기록을 삭제하지 않습니다.

## 운영 점검

- 도메인 만료일과 자동 갱신 결제수단
- GitHub·Cloudflare 계정의 2단계 인증과 복구 수단
- Cloudflare Pages 최신 배포 상태
- 운영 도메인의 인증서, HTTP 상태, 전화·카카오톡 CTA

현재 정적 보안 헤더는 `public/_headers`에서 관리합니다. CSP, HSTS, DNSSEC는 사이트 코드와 분리된 운영 작업으로 남겨둡니다.
