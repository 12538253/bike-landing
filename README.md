# bike-manager-landing

바이크매니저 홈페이지 소스입니다.

- 운영 사이트: [https://www.bike-manager.com](https://www.bike-manager.com)
- 사용 환경: Node.js 22.x, Next.js 16.3.1, React 19.2.8, Tailwind CSS 4.3.3
- 배포 방식: Cloudflare Pages 정적 배포 (`out`)

`main`에 push하면 운영 사이트가 자동으로 배포됩니다. 확인이 끝나기 전에는 작업 브랜치만 push합니다.

## 로컬 실행

```bash
npm ci
npm run dev
```

정적 결과물을 확인할 때는 먼저 빌드합니다.

```bash
npm run build
npm run preview
```

## 자주 수정하는 곳

| 바꾸려는 내용 | 파일 |
| --- | --- |
| 전화번호, 주소, 외부 링크, 사례, FAQ, 검색 메타 | `content/site.ts` |
| 페이지 섹션 순서 | `app/page.tsx` |
| metadata, JSON-LD | `app/layout.tsx` |
| 화면 구성과 인터랙션 | `components/` |
| 색상, 글자 크기, 반응형 스타일 | `app/globals.css` |
| 이미지 | `public/images/` |
| Cloudflare 보안 헤더 | `public/_headers` |
| 회귀 테스트 | `tests/` |

## 확인

아래 명령 하나로 lint, 정적 빌드, HTML 테스트, Chromium 테스트를 차례로 실행합니다.

```bash
npm run verify
```

의존성 취약점은 별도로 확인합니다.

```bash
npm audit --omit=dev
```

GitHub Actions도 브랜치 push와 `main` 대상 pull request에서 같은 검증을 실행합니다.

## 문구와 이미지

- 대표 전화는 `010-7616-4949`입니다.
- `24시간`은 문의를 남길 수 있다는 뜻이며 즉시 방문을 보장하지 않습니다.
- 리뷰 수는 코드에 적지 않고 [네이버 플레이스](https://naver.me/F1rPbAcV)로 연결합니다.
- 거래 사례는 [바이크매니저 블로그](https://m.blog.naver.com/bikemanager4949)의 원문으로 연결합니다.
- 방문자 사진과 리뷰 문구는 복사하지 않습니다.
- 공식 블로그의 실제 매입 사진·영상은 내용을 확인한 뒤 미리보기에 사용할 수 있습니다. 번호판, 얼굴, 자택 단서는 자르거나 가립니다.
- 사진은 네이버 CDN에 직접 연결하지 않고 로컬 WebP로 저장합니다.
- 로고는 화면 캡처보다 공개 프로필 원본이나 업체가 준 원본을 우선합니다. 운영 반영 전 사용 여부를 다시 확인합니다.

## 배포

1. `codex/`로 시작하는 작업 브랜치에서 수정합니다.
2. `npm run verify`와 `npm audit --omit=dev`를 실행합니다.
3. 작업 브랜치만 push하고 Cloudflare Pages 미리보기를 확인합니다.
4. 미리보기의 `X-Robots-Tag: noindex`, 전화·카카오톡 링크, 모바일 화면을 점검합니다.
5. 업체가 확인한 뒤에만 `main`에 병합합니다.

Cloudflare DNS, 도메인 결제, production 브랜치와 롤백 절차는 [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)에 정리돼 있습니다.
