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

export type NavigationLink = Readonly<{
  label: string;
  href: `#${string}`;
}>;

export type ExternalLink = Readonly<{
  label: string;
  href: string;
  external: true;
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

export type SectionCopy = Readonly<{
  eyebrow: string;
  title: string;
  description?: string;
}>;

export type DisclosureCopy = Readonly<{
  summary: string;
  answer: string;
}>;

export type TrustSectionCopy = Readonly<{
  title: string;
  points: readonly [string, string, string, string];
}>;

export type QuoteSectionCopy = SectionCopy & Readonly<{
  description: string;
  items: readonly [string, string, string, string, string, string, string, string];
}>;

export type CaseStudySectionCopy = SectionCopy & Readonly<{
  description: string;
  cardLinkLabel: string;
  indexLink: ContactLink;
  placeLink: ExternalLink;
}>;

export type PurchaseGuideCopy = SectionCopy & Readonly<{
  description: string;
  disclosure: DisclosureCopy;
}>;

export type FaqSectionCopy = Readonly<{
  eyebrow: string;
  title: string;
  items: readonly FaqItem[];
}>;

export type LocationSectionCopy = Readonly<{
  storeLabel: string;
  hours: string;
  mapLink: ExternalLink;
  eyebrow: string;
  title: string;
}>;

export type FooterCopy = Readonly<{
  name: string;
  englishName: string;
  service: string;
  business: string;
  address: string;
  contact: string;
  copyright: string;
}>;

export type TransactionPathKey = "directVisit" | "sendFirst";

export type TransactionPathSection = Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  note: string;
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
  navigation: [
    { label: "거래 경로", href: "#process" },
    { label: "매입 사례", href: "#cases" },
    { label: "자주 묻는 질문", href: "#faq" },
  ] satisfies readonly NavigationLink[],
  metadata: {
    title: "바이크매니저 | 인천·서울·경기 중고 바이크 방문 매입",
    description:
      "인천·서울·경기 중고 바이크를 직접 방문해 매입합니다. 사진으로 예상 견적과 방문 일정을 빠르게 안내하고, 판매대금 입금 확인 후 상차합니다. 문의 010-7616-4949",
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
      "바이크는 그대로 두세요.",
      "직접 찾아가 매입합니다.",
    ],
    description:
      "사진을 보내주시면 예상 견적과 방문 시간을 먼저 알려드립니다. 현장에서 차량 상태와 최종 금액을 확인하고 판매대금 전액이 입금된 것을 확인한 뒤 상차합니다.",
    note:
      "사진으로 예상 금액을 먼저 안내하고, 최종 금액은 현장에서 차량 상태를 함께 확인한 뒤 확정합니다.",
    scrollLabel: "거래 원칙 확인하기",
  },
  contact: {
    heroKakao: {
      label: "카카오톡으로 사진 보내기",
      href: kakaoChatUrl,
      ctaId: "hero-kakao",
      external: true,
    } satisfies ContactLink,
    headerPhone: {
      label: "24시간 문의",
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
  },
  tradePathSection: {
    eyebrow: "두 갈래 거래 경로",
    title: "바이크는 그대로, 확인은 현장에서.",
    description: "시간과 번거로운 절차를 줄여 현장에서 거래를 마칩니다.",
    note:
      "사진으로 예상 견적을 먼저 안내하고, 방문 일정에 맞춰 현장에서 거래를 진행합니다.",
  } satisfies TransactionPathSection,
  tradePaths: {
    directVisit: {
      eyebrow: "현장에서 확인",
      title: "바이크매니저 직접 방문",
      steps: ["방문 일정", "현장 확인", "최종 금액", "입금 확인", "상차"],
      description:
        "약속한 장소에서 차량을 함께 살펴보고 최종 금액과 입금을 확인한 뒤 상차합니다.",
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
        "차량을 먼저 보낸다면 출발 전에 최종 금액과 감가 기준, 반환 조건, 왕복 운임을 확인하세요.",
      image: "/images/routes/send-first.webp",
      imageAlt: "측면에서 본 회색 혼다 PCX125 스쿠터",
      imagePosition: "center center",
      sourceUrl: "https://m.blog.naver.com/bikemanager4949/224362894515",
    } satisfies TransactionPath,
  } satisfies Readonly<Record<TransactionPathKey, TransactionPath>>,
  trustSection: {
    title: "거래 원칙",
    // Public source for the confirmed career claim: https://m.blog.naver.com/bikemanager4949
    points: ["경력 10년 이상", "24시간 문의 접수", "직접 방문·현장 확인", "입금 확인 후 상차"],
  } satisfies TrustSectionCopy,
  quoteSection: {
    eyebrow: "견적 준비",
    title: "사진 몇 장과 기본 정보만 보내주세요.",
    description: "밝은 곳에서 차량 전체와 하자 부위를 가까이 찍어주세요.",
    items: ["기종", "연식", "주행거리", "하자 내역", "폐지 여부", "검사 여부", "지역", "바이크 사진"],
  } satisfies QuoteSectionCopy,
  caseStudySection: {
    eyebrow: "실제 매입 사례",
    title: "말보다 실제 매입 기록으로 보여드립니다.",
    description: "당시 차량 사진과 거래 내용은 원문에서 확인하세요.",
    cardLinkLabel: "원문 보기",
    indexLink: {
      label: "공식 블로그에서 더 많은 사례 보기",
      href: officialBlogUrl,
      ctaId: "naver-proof",
      external: true,
    } satisfies ContactLink,
    placeLink: {
      label: "네이버 플레이스·리뷰 보기",
      href: naverPlaceUrl,
      external: true,
    } satisfies ExternalLink,
  } satisfies CaseStudySectionCopy,
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
  purchaseGuide: {
    eyebrow: "매입 가능 범위",
    title: "스쿠터부터 대형 바이크까지 매입 상담합니다.",
    description: "차량 상태와 등록 정보를 먼저 확인하고 매입 가능 여부와 필요한 서류를 알려드립니다.",
    disclosure: {
      summary: "명의·서류가 다른 경우",
      answer:
        "보통 신분증과 이륜자동차 사용신고필증 또는 폐지증명서를 확인합니다. 타인·법인·외국인 명의, 미성년자 소유, 서류 분실, 차대번호 훼손·재타각 차량은 추가 확인 후 필요한 서류와 진행 방법을 안내합니다.",
    },
  } satisfies PurchaseGuideCopy,
  faqSection: {
    eyebrow: "자주 묻는 질문",
    title: "문의할 때 많이 묻는 내용입니다.",
    items: [
      {
        question: "사진 견적이 최종 금액인가요?",
        answer:
          "사진 견적은 예상 금액입니다. 현장에서 차량과 서류를 확인하고 달라지는 이유와 최종 금액을 설명한 뒤 판매자가 동의하면 거래합니다.",
      },
      {
        question: "당일이나 늦은 시간에도 방문할 수 있나요?",
        answer:
          "24시간 편하게 문의하세요. 인천·서울·경기 지역은 당일·야간 방문도 일정에 맞춰 최대한 빠르게 조율해드립니다.",
      },
      {
        question: "번호판이 있거나 폐지 전인 차량도 상담할 수 있나요?",
        answer:
          "가능합니다. 등록 상태와 본인 소유 여부를 먼저 확인하고 필요한 서류와 절차를 알려드립니다.",
      },
    ],
  } satisfies FaqSectionCopy,
  locationSection: {
    storeLabel: "인천 오프라인 매장",
    hours: "24시간 문의 접수 · 방문 전 연락",
    mapLink: {
      label: "네이버 지도에서 위치·리뷰 보기",
      href: naverPlaceUrl,
      external: true,
    },
    eyebrow: "사진부터 보내주세요.",
    title: "예상 견적부터 방문 일정까지 빠르게 안내합니다.",
  } satisfies LocationSectionCopy,
  footer: {
    name: "바이크매니저",
    englishName: "BIKE MANAGER",
    service: "중고 바이크 직접 방문·현장 거래",
    business: "상호명 바이크매니저",
    address: "인천광역시 남동구 백범로 411 1층(간석동)",
    contact: "24시간 문의 접수 · 방문 전 연락 · 010-7616-4949",
    copyright: "© 2026 BIKE MANAGER. All rights reserved.",
  } satisfies FooterCopy,
} as const;
