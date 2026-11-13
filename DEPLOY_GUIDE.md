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
6. 사용자가 해당 변경의 운영 반영을 명시적으로 요청한 뒤에만 pull request를 `main`에 병합합니다.
7. 운영 도메인의 HTTP 상태와 주요 CTA를 다시 확인합니다.

## 운영에서 변경하지 않는 항목

미리보기 승인 전에는 아래 설정을 수정하지 않습니다.

- Cloudflare DNS와 custom domain
- 도메인 등록·결제·자동 갱신
- Pages production branch
- `main` 브랜치

## 장애 복구

2026-11-13 GEO/AEO 문구 교정과 FAQ 안내 링크 추가 직전의 운영 기준은 다음과 같습니다. 이 버전은 기존 보안 의존성 업데이트와 업체 소개, 방문 매입 안내를 포함합니다.

- 운영 커밋: `0683a542ea7cb075735cf6c83115ce146edb7286`
- 성공한 production 배포: `bd0a35f9-6fae-458d-97dd-d576058d6c08`
- 배포 보관 주소: `https://bd0a35f9.bike-manager.pages.dev`
- [Cloudflare 배포 상세](https://dash.cloudflare.com/?to=/1db0ef443261ec647952b10096f1fbe0/pages/view/bike-manager/bd0a35f9-6fae-458d-97dd-d576058d6c08)

운영 반영 뒤 문제가 생기면 Pages 프로젝트의 **Deployments**에서 위 production 배포의 **Rollback to this deployment**를 선택합니다. 성공한 production 배포만 롤백 대상으로 사용할 수 있습니다.

이어서 이번 업데이트 PR의 squash 병합 커밋을 `git revert`하고 검증한 뒤 `main`에 push합니다. 이렇게 해야 다음 자동 배포도 복구한 소스를 유지합니다. Cloudflare에 접근할 수 없다면 Git 되돌림과 자동 재배포로 복구합니다. 이 방법은 빌드와 배포가 끝날 때까지 시간이 걸립니다.

되돌릴 커밋은 이번 운영 반영 PR의 `mergeCommit`으로 확인합니다. `git reset --hard`나 강제 push 대신 새 되돌림 커밋을 사용합니다. 즉시 복구에는 위 Cloudflare 보관 배포를 사용하며, 전체 재빌드가 필요한 Git 복구와 구분합니다.

복구 후 운영 홈페이지와 연락 링크를 확인합니다. DNS를 바꾸거나 Git 기록을 삭제하지 않습니다.

## 운영 점검

- 도메인 만료일과 자동 갱신 결제수단
- GitHub·Cloudflare 계정의 2단계 인증과 복구 수단
- Cloudflare Pages 최신 배포 상태
- 운영 도메인의 인증서, HTTP 상태, 전화·카카오톡 CTA

현재 정적 보안 헤더는 `public/_headers`에서 관리합니다. CSP, HSTS, DNSSEC는 사이트 코드와 분리된 운영 작업으로 남겨둡니다.
