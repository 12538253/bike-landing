# Cloudflare Pages 배포 가이드

바이크 매니저 랜딩 페이지를 **Cloudflare**에 무료로 배포하는 가장 쉬운 방법입니다.

## 1. 사전 준비 (이미 완료됨)
제가 프로젝트 설정을 **'정적 내보내기 (Static Export)'** 모드로 변경해 두었습니다.
- 덕분에 서버비용 0원, 속도는 가장 빠른 상태입니다.


### (선택) 3. 커스텀 도메인 연결 (www.bike-manager.com & bike-manager.com)
1. Cloudflare Pages 대시보드 → `bike-landing` 프로젝트 클릭
2. **Custom domains** 탭 클릭 → **Set up a custom domain** 버튼 클릭
3. 도메인 두 개를 모두 등록해야 합니다:
   - `www.bike-manager.com` (메인)
   - `bike-manager.com` (서브)
4. Cloudflare가 안내하는 대로 DNS 레코드(CNAME/A) 설정
5. **(중요)** 두 도메인 모두 `Active` 상태가 되어야 접속이 원활합니다.

## 🔄 업데이트 방법 (유지보수)GitHub 연동 방식 - 추천)

가장 권장하는 방식입니다. 소스 코드를 수정하고 저장하면 자동으로 사이트도 업데이트됩니다.

1.  **GitHub에 코드 올리기**:
    - 현재 프로젝트를 본인의 GitHub 저장소(Repository)에 업로드합니다.
2.  **Cloudflare 대시보드 접속**:
    - [Cloudflare Pages](https://dash.cloudflare.com/) 로그인.
    - **Workers & Pages** -> **Create Application** -> **Pages** -> **Connect to Git** 클릭.
3.  **설정 입력**:
    - 저장소를 선택하고 **Begin setup**.
    - **Build Settings** (빌드 설정):
        - **Framework Preset**: `Next.js (Static Export)` 선택 (없으면 Next.js 선택).
        - **Build command**: `npm run build`
        - **Build output directory**: `out` (**중요**: `.next`가 아니라 `out`입니다)
4.  **Save and Deploy** 클릭.

---

## 3. 배포 방법 (직접 업로드 방식)

GitHub 없이 결과물만 바로 올리고 싶으실 때 사용하세요.

1.  **로컬에서 빌드하기**:
    - 터미널에 `npm run build` 입력.
    - 완료되면 프로젝트 폴더에 `out`이라는 폴더가 생깁니다.
2.  **Cloudflare에 업로드**:
    - [Cloudflare Pages](https://dash.cloudflare.com/) -> **Create Application** -> **Pages** -> **Upload assets**.
    - 방금 생긴 `out` 폴더를 통째로 드래그해서 넣으세요.
    - 배포 완료!

## 문제 발생 시 체크리스트
- **이미지가 안 나오나요?**: `next.config.ts`에 `unoptimized: true` 설정이 되어 있는지 확인하세요 (제가 이미 해뒀습니다).
- **404 에러**: Output Config가 `out` 폴더로 잘 잡혔는지 확인하세요.

## 4. 수정 및 재배포 방법 (아주 쉬움!)

사이트 내용을 수정하고 싶으신가요? **클라우드플레어에는 들어갈 필요가 없습니다.**

1.  컴퓨터에서 코드를 수정합니다.
2.  터미널에 다음 3줄을 입력합니다.

```bash
git add .
git commit -m "내용 수정"
git push
```

**이게 끝입니다!**
`git push`만 하면 1~2분 뒤에 **저절로** 사이트가 바뀝니다. (자동 배포 시스템)
