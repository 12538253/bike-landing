# 🏍️ 바이크매니저 (Bike Manager)

> **"처남, 요즘 바이크 매입 잘 돼?"**
>
> "아니 형님, 요즘 당근마켓 때문에 힘드네요. 홈페이지 하나 있으면 좋을 텐데..."
>
> **"...그거 내가 한번 만들어볼게. 요즘 알잘딱깔센 AI랑 리액트 공부하고 있거든."**

<br/>

## 📝 프로젝트 소개 (Project Info)

이 프로젝트는 중고 오토바이 매매를 하시는 **처남을 위해** 제작된 랜딩 페이지입니다.
개인적으로는 **최신 Next.js 16과 AI 코딩 툴을 학습**하고, 실제 상업용 수준의 퍼포먼스를 내는 웹사이트를 구축해보는 것을 목표로 했습니다.

단순한 홍보 페이지를 넘어, **SEO(검색 최적화)**와 **모바일 사용자 경험(UX)**을 극대화하여 실제 문의 전환율을 높이는 데 초점을 맞췄습니다.

🔗 **라이브 데모**: [https://www.bike-manager.com](https://www.bike-manager.com)

<br/>

## 🛠 사용 기술 (Tech Stack)

"형님 이거 무슨 툴로 만드신 거예요?"
"요즘 제일 핫한 걸로만 꽉 채워 넣었다."

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack) - *빠르고 SEO에 최강*
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) - *다크 모드 간지 구현*
- **Animation**: [Framer Motion](https://www.framer.com/motion/) - *고급진 등장 효과*
- **Deployment**: [Cloudflare Pages](https://pages.cloudflare.com/) - *서버비 0원, 속도는 광속*
- **SEO Tools**: `next/head`, `JSON-LD` (구조화 데이터), `Open Graph`

<br/>

## ✨ 주요 기능 (Key Features)

### 1. 전환율을 높이는 UX (Conversion Focused)
- **모바일 최적화**: 바이크 유저 90%가 모바일 접속. 하단에 `카톡 문의` 버튼을 고정해서 언제든 연락 가능하게 함.
- **실시간 구매 티커**: "방금 OO님이 300만원에 판매하셨습니다" 흐르는 자막으로 신뢰도 상승 (CSS Infinite Scroll).
- **1분 견적**: 복잡한 가입 없이 바로 카톡으로 연결.

### 2. 신뢰도 마케팅 (Trust & Social Proof)
- **네이버/당근 인증 배지**: 공식 앱 아이콘을 박아서 "인증된 업체" 느낌 팍팍 줌.
- **투명한 가격표**: 스캐너 진단비, 출장비 등을 명시해서 "눈탱이 없다"는 걸 강조.
- **반응형 디자인**: 아이패드, 갤럭시 폴드, 아이폰 미니 어디서 봐도 예쁨.

### 3. 기술적 최적화 (Technical Polish)
- **SEO 완비**: 네이버랑 구글이 좋아하도록 `robots.txt`, `sitemap.xml`, `meta 태그` 풀세팅.
- **성능 최적화**: 라이트하우스 점수 95+점. (이미지 최적화 `next/image` 사용)
- **정적 배포**: `output: 'export'` 설정으로 정적 HTML로 변환, 로딩 속도 극대화.

<br/>

## 🚀 실행 방법 (Getting Started)

"형님 저도 코드 좀 볼 수 있어요?"
"그럼, 깃허브 봐봐."

### 설치 및 실행

```bash
# 1. 레포지토리 복제
git clone https://github.com/your-username/bike-manager.git

# 2. 패키지 설치
npm install

# 3. 개발 서버 실행
npm run dev
```

### 배포 (Cloudflare Pages)

서버비 아끼려고 **정적 내보내기(Static Export)** 방식을 썼습니다.

1. 빌드 명령어 실행:
   ```bash
   npm run build
   # out 폴더가 생성됩니다.
   ```
2. Cloudflare Pages에 `out` 폴더 업로드하면 끝!

<br/>

## 📂 폴더 구조 (Structure)

```
├── app/                  # Next.js 앱 라우터 (여기가 핵심)
│   ├── layout.tsx        # 전체 레이아웃 (SEO 설정 포함)
│   ├── page.tsx          # 메인 페이지 조립
│   └── globals.css       # 전체 스타일
├── components/           # 레고 블록들 (재사용 컴포넌트)
│   ├── Hero.tsx          # 첫 화면 (임팩트 담당)
│   ├── TrustSection.tsx  # 신뢰 포인트
│   ├── ReviewsSection.tsx# 후기 & 인증 배지
│   └── ...
└── public/               # 이미지 파일들
```

<br/>

## 📝 후기 (Retrospect)

AI를 활용해서 코딩하니 생산성이 엄청나네요.
처남이 이 홈페이지로 대박 나서 나중에 **할리 데이비슨** 한 대 뽑아줬으면 좋겠습니다.

---

**© 2025 Bike Manager Project** | Made with 🧡 by Brother-in-law
