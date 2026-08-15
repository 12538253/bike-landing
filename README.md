# 바이크매니저 랜딩 페이지

인천·서울·경기 중고 바이크 방문 매입 서비스의 공식 랜딩 페이지입니다. 판매자가 차량을 먼저 보내지 않고, 현장에서 상태와 최종 금액을 확인한 뒤 입금 확인 후 상차하는 거래 절차를 중심으로 구성했습니다.

- 운영 사이트: [https://www.bike-manager.com](https://www.bike-manager.com)
- 프레임워크: Next.js 16 App Router, React 19, Tailwind CSS 4
- 배포: Cloudflare Pages 정적 export (`out`)
- 런타임: Node.js 22

## 로컬 실행

```bash
npm ci
npm run dev
```

정적 결과물을 만들고 확인하려면 다음 명령을 사용합니다.

```bash
npm run build
npm run preview
```

## 검증

```bash
npm run lint
npm run build
npm run test:static
npm run test:e2e
npm audit --omit=dev
```

`npm run verify`는 lint, build, 정적 HTML 테스트, Chromium 인터랙션 테스트를 순서대로 실행합니다. GitHub Actions도 브랜치 push와 pull request에서 같은 검증을 수행합니다.

## 구조

- `content/site.ts`: 전화번호, 주소, 링크, 사례, FAQ, 메타데이터의 단일 정보원
- `app/page.tsx`: 페이지 섹션 조립
- `app/layout.tsx`: 메타데이터와 JSON-LD
- `components/ProcessStory.tsx`: 데스크톱 거래 단계 스크롤 인터랙션
- `components/StickyInquiryBar.tsx`: 모바일 문의 바 표시·숨김
- `public/_headers`: Cloudflare Pages 정적 보안 헤더
- `tests/static-export.test.mjs`: 연락처·canonical·JSON-LD·가짜 신뢰 요소 회귀 테스트
- `tests/e2e/renewal.spec.ts`: 반응형·모션 감소·hydration·인터랙션 테스트

## 콘텐츠 원칙

- 대표 전화는 `010-7616-4949`로 통일합니다.
- `24시간`은 문의 접수를 뜻하며 즉시 방문을 보장하지 않습니다.
- 리뷰 수는 고정하지 않고 네이버 플레이스의 현재 정보로 연결합니다.
- 사례는 업체 공식 블로그 원문으로 연결합니다.
- 방문자 사진과 리뷰 문구는 복사하지 않습니다.
- 사례 카드의 현재 이미지는 미리보기용 기존 자산입니다. 운영 반영 전 업체가 공식 사진 사용을 확인해야 합니다.

배포와 운영 안전 수칙은 [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)를 참고하세요.
