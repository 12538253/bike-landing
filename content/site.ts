export type CtaId =
  | "hero-kakao"
  | "header-phone"
  | "sticky-kakao"
  | "final-phone"
  | "naver-proof"
  | "method-kakao";

export type ContactLink = Readonly<{
  label: string;
  href: string;
  ctaId: CtaId;
  external?: boolean;
}>;

export type CaseStudy = Readonly<{
  layout: "featured" | "portrait";
  region: string;
  model: string;
  summary?: string;
  sourceUrl: string;
  sourceLabel: string;
  image: string;
  imageAlt: string;
  imagePosition: string;
}>;

export type FaqItem = Readonly<{
  question: string;
  answer: string;
}>;

export type TransactionPathKey = "directVisit" | "sendFirst";

export type TransactionPathSection = Readonly<{
  title: string;
  description: string;
}>;

export type TransactionPath = Readonly<{
  eyebrow: string;
  title: string;
  steps: readonly string[];
  description: string;
  image: string;
  imageAlt: string;
  imagePosition: string;
  sourceUrl: string;
  confirmation?: Readonly<{
    label: string;
    detail: string;
  }>;
  cta?: ContactLink;
}>;

const phoneNumber = "010-7616-4949";
const kakaoChatUrl = "https://pf.kakao.com/_MzgSn/chat";
const naverPlaceUrl = "https://naver.me/F1rPbAcV";
const officialBlogUrl = "https://m.blog.naver.com/bikemanager4949";

export const site = {
  name: "바이크매니저",
  englishName: "BIKE MANAGER",
  canonicalUrl: "https://www.bike-manager.com",
  phone: {
    display: phoneNumber,
    href: `tel:${phoneNumber}`,
  },
  address: {
    short: "인천 남동구 백범로 411 1층",
    full: "인천광역시 남동구 백범로 411 1층(간석동)",
    street: "백범로 411 1층",
    locality: "남동구",
    region: "인천광역시",
    country: "KR",
  },
  business: {
    copyrightYear: "2026",
  },
  links: {
    kakao: kakaoChatUrl,
    naverPlace: naverPlaceUrl,
    officialBlog: officialBlogUrl,
  },
  metadata: {
    title: "바이크매니저 | 인천·서울·경기 중고 바이크 방문 매입",
    description:
      "바이크를 먼저 보내지 않아도 됩니다. 사진으로 예상 견적과 방문 가능 시간을 안내하고, 현장에서 확인한 뒤 입금 확인 후 상차합니다. 문의 010-7616-4949",
    keywords: [
      "중고오토바이매입",
      "중고바이크매입",
      "인천오토바이매입",
      "서울오토바이매입",
      "경기오토바이매입",
      "바이크매니저",
    ],
    ogImage: "/images/og-bike-manager.jpg",
    ogImageAlt: "도심 도로에 세워진 검은색 바이크",
  },
  hero: {
    eyebrow: "인천·서울·경기 중고 바이크 방문 매입",
    titleLines: [
      "바이크를 먼저 보내지 않아도 됩니다.",
      "직접 찾아가 현장에서 거래합니다.",
    ],
    description:
      "사진으로 예상 견적과 방문 시간을 먼저 안내합니다. 현장에서 차량 상태와 최종 금액을 확인하고, 판매대금 입금 확인 후 상차합니다.",
    note:
      "사진 견적은 예상 금액이며, 최종 금액은 현장 상태에 따라 달라질 수 있습니다.",
  },
  contact: {
    heroKakao: {
      label: "카카오톡으로 사진 보내기",
      href: kakaoChatUrl,
      ctaId: "hero-kakao",
      external: true,
    } satisfies ContactLink,
    headerPhone: {
      label: `24시간 문의 ${phoneNumber}`,
      href: `tel:${phoneNumber}`,
      ctaId: "header-phone",
    } satisfies ContactLink,
    stickyKakao: {
      label: "카카오톡 문의",
      href: kakaoChatUrl,
      ctaId: "sticky-kakao",
      external: true,
    } satisfies ContactLink,
    finalPhone: {
      label: "전화로 상담하기",
      href: `tel:${phoneNumber}`,
      ctaId: "final-phone",
    } satisfies ContactLink,
    naverProof: {
      label: "공식 블로그에서 더 많은 사례 보기",
      href: officialBlogUrl,
      ctaId: "naver-proof",
      external: true,
    } satisfies ContactLink,
  },
  tradePathSection: {
    title: "차량은 곁에 두고, 거래 조건은 현장에서 확인하세요.",
    description: "약속한 장소에서 차량 상태와 최종 금액을 함께 확인합니다.",
  } satisfies TransactionPathSection,
  tradePaths: {
    directVisit: {
      eyebrow: "현장에서 확인",
      title: "바이크매니저 직접 방문",
      steps: ["방문 일정", "현장 확인", "최종 금액", "입금 확인", "상차"],
      description:
        "약속한 장소에서 차량을 함께 확인하고, 최종 금액 안내와 입금 확인을 마친 뒤 상차합니다.",
      image: "/images/routes/direct-visit.webp",
      imageAlt: "늦은 저녁 운송 차량에 실린 혼다 ADV350 스쿠터",
      imagePosition: "center center",
      sourceUrl: "https://m.blog.naver.com/bikemanager4949/224355424035",
      confirmation: {
        label: "입금 확인",
        detail: "확인 후 상차",
      },
      cta: {
        label: "사진 보내고 방문 일정 확인",
        href: kakaoChatUrl,
        ctaId: "method-kakao",
        external: true,
      } satisfies ContactLink,
    } satisfies TransactionPath,
    sendFirst: {
      eyebrow: "출발 전에 확인",
      title: "차량을 먼저 보내는 방식",
      steps: ["최종 금액·감가 기준", "반환 조건", "왕복 운임"],
      description:
        "차량을 먼저 보낸다면 출발 전에 최종 금액, 감가 기준, 반환 조건과 왕복 운임을 확인하세요.",
      image: "/images/routes/send-first.webp",
      imageAlt: "측면에서 본 회색 혼다 PCX125 스쿠터",
      imagePosition: "center center",
      sourceUrl: "https://m.blog.naver.com/bikemanager4949/224362894515",
    } satisfies TransactionPath,
  } satisfies Readonly<Record<TransactionPathKey, TransactionPath>>,
  trustPoints: [
    // Public source for the confirmed career claim: https://m.blog.naver.com/bikemanager4949
    "경력 10년 이상",
    "24시간 문의 접수",
    "직접 방문·현장 확인",
    "입금 확인 후 상차",
  ],
  quoteItems: [
    "기종",
    "연식",
    "주행거리",
    "하자 내역",
    "폐지 여부",
    "검사 여부",
    "지역",
    "바이크 사진",
  ],
  cases: [
    {
      layout: "featured",
      region: "서울 은평구",
      model: "ADV350",
      summary:
        "늦은 저녁 자택으로 찾아가 차량을 확인하고 현장에서 대금을 지급했습니다.",
      sourceUrl: "https://m.blog.naver.com/bikemanager4949/224355424035",
      sourceLabel: "공식 블로그에서 서울 은평구 ADV350 매입 기록 보기",
      image: "/images/cases/adv350.webp",
      imageAlt: "실내에 측면으로 세워진 흰색 혼다 ADV350 스쿠터",
      imagePosition: "60% center",
    },
    {
      layout: "portrait",
      region: "인천 부평",
      model: "PCX125",
      sourceUrl: "https://m.blog.naver.com/bikemanager4949/224362894515",
      sourceLabel: "공식 블로그에서 인천 부평 PCX125 매입 기록 보기",
      image: "/images/cases/pcx125.webp",
      imageAlt: "검은 배경 앞에 앞면이 보이게 세워진 회색 혼다 PCX125 스쿠터",
      imagePosition: "center 48%",
    },
    {
      layout: "portrait",
      region: "부천",
      model: "아이언883",
      sourceUrl: "https://m.blog.naver.com/bikemanager4949/224351926598",
      sourceLabel: "공식 블로그에서 부천 아이언883 매입 기록 보기",
      image: "/images/cases/iron883.webp",
      imageAlt: "도로 가장자리에 앞면이 보이게 세워진 검은색 할리데이비슨 아이언883 바이크",
      imagePosition: "center 52%",
    },
  ] satisfies readonly CaseStudy[],
  faq: [
    {
      question: "사진 견적이 최종 금액인가요?",
      answer:
        "사진 견적은 예상 금액입니다. 현장 상태를 확인하고 달라지는 이유와 최종 금액을 설명한 뒤 판매자가 동의하면 거래합니다.",
    },
    {
      question: "24시간 바로 방문하나요?",
      answer:
        "24시간은 문의 접수이며 즉시 방문을 보장하지 않습니다. 방문 시간은 지역과 당일 일정을 확인한 뒤 안내합니다.",
    },
    {
      question: "번호판이 있거나 폐지 전이어도 상담할 수 있나요?",
      answer:
        "가능합니다. 등록 상태와 본인 소유 여부를 먼저 확인하고 필요한 서류와 절차를 안내합니다.",
    },
  ] satisfies readonly FaqItem[],
} as const;
