export type CtaId =
  | "hero-kakao"
  | "final-kakao"
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
  proof: string;
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
  description?: string;
  cardLinkLabel: string;
  indexLink: ContactLink;
  placeLink: ExternalLink;
}>;

export type SupportSectionCopy = SectionCopy & Readonly<{
  description: string;
  disclosure: DisclosureCopy;
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

export type VisitStageKey = "photoGuide" | "onsiteDeal";

export type VisitStage = Readonly<{
  title: string;
  description: string;
  facts: readonly string[];
  confirmation?: Readonly<{
    label: string;
    detail: string;
  }>;
}>;

export type VisitFlowCopy = SectionCopy & Readonly<{
  stages: Readonly<Record<VisitStageKey, VisitStage>>;
  cta: ContactLink;
  safety: DisclosureCopy;
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
    { label: "진행 방법", href: "#process" },
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
      "사진으로 예상 견적과 방문 시간을 먼저 안내합니다. 약속한 장소에서 차량과 최종 금액을 함께 확인하고, 판매대금 전액 입금 후 상차합니다.",
    note: "경력 10년 이상 · 입금 확인 후 상차",
    scrollLabel: "진행 방법 보기",
  },
  contact: {
    heroKakao: {
      label: "카카오톡으로 사진 보내기",
      href: kakaoChatUrl,
      ctaId: "hero-kakao",
      external: true,
    } satisfies ContactLink,
    finalKakao: {
      label: "사진 보내고 예상 견적 확인",
      href: kakaoChatUrl,
      ctaId: "final-kakao",
      external: true,
    } satisfies ContactLink,
    headerPhone: {
      label: "전화 상담",
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
      label: "전화로 차량 상담하기",
      href: `tel:${phoneNumber}`,
      ctaId: "final-phone",
    } satisfies ContactLink,
  },
  visitFlow: {
    eyebrow: "사진 확인부터 현장 거래까지",
    title: "바이크는 그대로 두고, 사진만 보내주세요.",
    description: "바이크매니저가 약속한 장소로 직접 찾아갑니다.",
    stages: {
      photoGuide: {
        title: "사진으로 먼저 안내",
        description: "기종·연식·주행거리·지역과 사진을 보내주시면 예상 견적과 방문 가능한 시간을 안내합니다.",
        facts: ["예상 견적", "방문 시간"],
      } satisfies VisitStage,
      onsiteDeal: {
        title: "약속한 장소에서 함께 확인",
        description: "차량과 서류를 함께 확인하고, 최종 금액과 판매대금 전액 입금을 확인한 뒤 상차합니다.",
        facts: ["차량 상태", "최종 금액", "전액 입금", "상차"],
        confirmation: {
          label: "입금 확인",
          detail: "확인 후 상차",
        },
      } satisfies VisitStage,
    },
    cta: {
      label: "사진 보내고 방문 일정 확인",
      href: kakaoChatUrl,
      ctaId: "method-kakao",
      external: true,
    } satisfies ContactLink,
    safety: {
      summary: "차량을 보내는 거래라면 무엇을 확인해야 하나요?",
      answer: "출발 전에 최종 금액과 감가 기준, 거래 중단 시 반환 조건, 왕복 운임 부담을 확인하세요. 바이크매니저는 약속한 장소로 직접 방문해 현장에서 거래합니다.",
    },
  } satisfies VisitFlowCopy,
  trustSection: {
    title: "거래 원칙",
    points: ["24시간 문의 접수", "인천·서울·경기 직접 방문", "스쿠터부터 대형 바이크까지", "공식 블로그 실제 사례"],
  } satisfies TrustSectionCopy,
  quoteSection: {
    eyebrow: "견적 준비",
    title: "사진 몇 장과 기본 정보만 보내주세요.",
    description: "밝은 곳에서 차량 전체와 확인이 필요한 부위를 가까이 찍어주세요.",
    items: ["기종", "연식", "주행거리", "하자 내역", "폐지 여부", "검사 여부", "지역", "바이크 사진"],
  } satisfies QuoteSectionCopy,
  caseStudySection: {
    eyebrow: "실제 매입 사례",
    title: "공식 블로그에 남긴 실제 매입 기록입니다.",
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
      proof: "늦은 저녁 자택 방문 · 현장 확인 후 대금 지급",
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
      proof: "공식 블로그 매입 기록",
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
      proof: "공식 블로그 매입 기록",
      sourceUrl: "https://m.blog.naver.com/bikemanager4949/224351926598",
      sourceLabel: "공식 블로그에서 부천 아이언883 매입 기록 보기",
      image: "/images/cases/iron883.webp",
      imageAlt: "도로 가장자리에 앞면이 보이게 세워진 검은색 할리데이비슨 아이언883 바이크",
      imagePosition: "center 52%",
    },
  ] satisfies readonly CaseStudy[],
  supportSection: {
    eyebrow: "상담·서류 안내",
    title: "스쿠터부터 대형 바이크까지 상담합니다.",
    description: "차량 상태와 등록 정보를 확인해 진행 가능 여부와 필요한 서류를 안내합니다.",
    disclosure: {
      summary: "명의·서류가 다른 경우",
      answer:
        "보통 신분증과 이륜자동차 사용신고필증 또는 폐지증명서를 확인합니다. 타인·법인·외국인 명의, 미성년자 소유, 서류 분실, 차대번호 훼손·재타각 차량은 현재 상태를 알려주시면 필요한 확인 사항과 서류를 안내합니다.",
    },
    items: [
      {
        question: "최종 금액은 어떻게 정하나요?",
        answer:
          "사진으로 예상 금액을 먼저 안내합니다. 현장에서 차량과 서류를 함께 확인하고, 변동 사유와 최종 금액을 설명드린 뒤 동의하신 금액으로 거래합니다.",
      },
      {
        question: "방문 시간은 어떻게 정하나요?",
        answer:
          "문의는 24시간 접수합니다. 인천·서울·경기 지역과 당일 일정을 확인해 방문 가능한 시간을 안내하며, 늦은 시간도 일정에 맞춰 조율합니다.",
      },
      {
        question: "개인 거래와 업체 매입은 어떻게 다른가요?",
        answer:
          "일정 조율과 현장 처리를 한 번에 마치고 싶다면 업체 매입이 잘 맞습니다. 가격을 가장 우선한다면 개인 거래도 함께 비교해 보세요.",
      },
    ],
  } satisfies SupportSectionCopy,
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
    contact: "문의 010-7616-4949",
    copyright: "© 2026 BIKE MANAGER. All rights reserved.",
  } satisfies FooterCopy,
} as const;
