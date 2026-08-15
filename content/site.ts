export type CtaId =
  | "hero-kakao"
  | "header-phone"
  | "sticky-kakao"
  | "final-phone"
  | "naver-proof";

export type ContactLink = Readonly<{
  label: string;
  href: string;
  ctaId: CtaId;
  external?: boolean;
}>;

export type CaseStudy = Readonly<{
  region: string;
  model: string;
  summary: string;
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

export type ProcessStep = Readonly<{
  number: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  imagePosition: string;
}>;

const phoneNumber = "010-7616-4949";
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
    kakao: "https://pf.kakao.com/_MzgSn/chat",
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
      "사진을 보내주시면 예상 견적과 방문 가능 시간을 먼저 안내합니다. 현장에서 상태를 확인한 뒤 판매대금을 전액 이체하고, 입금 확인 후 상차합니다.",
    note:
      "먼저 드리는 견적은 보내주신 정보가 기준입니다. 최종 금액은 현장에서 확인한 차량 상태에 따라 달라질 수 있습니다.",
  },
  contact: {
    heroKakao: {
      label: "카카오톡으로 사진 보내기",
      href: "https://pf.kakao.com/_MzgSn/chat",
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
      href: "https://pf.kakao.com/_MzgSn/chat",
      ctaId: "sticky-kakao",
      external: true,
    } satisfies ContactLink,
    finalPhone: {
      label: "전화로 상담하기",
      href: `tel:${phoneNumber}`,
      ctaId: "final-phone",
    } satisfies ContactLink,
    naverProof: {
      label: "공식 블로그에서 실제 거래 사례 보기",
      href: officialBlogUrl,
      ctaId: "naver-proof",
      external: true,
    } satisfies ContactLink,
  },
  trustPoints: [
    // Public source for the confirmed career claim: https://m.blog.naver.com/bikemanager4949
    {
      title: "경력 10년 이상",
      description: "현장에서 쌓은 바이크 거래 경험을 바탕으로 상담합니다.",
    },
    {
      title: "24시간 문의 가능",
      description: "늦은 시간에도 문의는 남겨주세요. 방문 일정은 확인 후 알려드립니다.",
    },
    {
      title: "직접 방문·현장 검수",
      description: "차량을 먼저 보낼 필요 없이 약속한 장소에서 함께 상태를 살핍니다.",
    },
    {
      title: "입금 확인 후 상차",
      description: "계약 내용을 확인하고 판매대금이 들어온 뒤 차량을 싣습니다.",
    },
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
      region: "서울 은평구",
      model: "ADV350",
      summary:
        "늦은 저녁 일정을 조율해 자택에서 차량을 함께 확인하고 현장에서 대금을 지급한 방문 매입 사례입니다.",
      sourceUrl: "https://m.blog.naver.com/bikemanager4949/224355424035",
      sourceLabel: "공식 블로그에서 서울 은평구 ADV350 매입 기록 보기",
      image: "/images/cases/adv350.webp",
      imageAlt: "실내에 측면으로 세워진 흰색 혼다 ADV350 스쿠터",
      imagePosition: "60% center",
    },
    {
      region: "인천 부평",
      model: "PCX125",
      summary: "인천 부평에서 PCX125를 직접 확인한 방문 매입 사례입니다.",
      sourceUrl: "https://m.blog.naver.com/bikemanager4949/224362894515",
      sourceLabel: "공식 블로그에서 인천 부평 PCX125 매입 기록 보기",
      image: "/images/cases/pcx125.webp",
      imageAlt: "검은 배경 앞에 앞면이 보이게 세워진 회색 혼다 PCX125 스쿠터",
      imagePosition: "center 48%",
    },
    {
      region: "부천",
      model: "아이언883",
      summary: "부천에서 아이언883을 확인한 방문 매입 사례입니다.",
      sourceUrl: "https://m.blog.naver.com/bikemanager4949/224351926598",
      sourceLabel: "공식 블로그에서 부천 아이언883 매입 기록 보기",
      image: "/images/cases/iron883.webp",
      imageAlt: "도로 가장자리에 앞면이 보이게 세워진 검은색 할리데이비슨 아이언883 바이크",
      imagePosition: "center 52%",
    },
  ] satisfies readonly CaseStudy[],
  processSteps: [
    {
      number: "01",
      title: "문의",
      description:
        "카카오톡이나 전화로 기종, 연식, 주행거리, 하자·폐지·검사 여부, 지역과 차량 사진을 알려주세요.",
      image: "/images/hero-bg.webp",
      imageAlt: "카카오톡이나 전화로 바이크 정보를 전하는 문의 단계",
      imagePosition: "25% center",
    },
    {
      number: "02",
      title: "예상 견적",
      description:
        "보내주신 내용을 살펴보고 사진 기준 예상 견적과 방문 가능한 시간을 알려드립니다.",
      image: "/images/hero-bg.webp",
      imageAlt: "사진을 살펴보고 예상 견적과 방문 시간을 안내하는 단계",
      imagePosition: "45% center",
    },
    {
      number: "03",
      title: "현장 검수",
      description:
        "약속한 장소에서 차량 상태와 서류를 함께 확인하고 최종 거래 조건을 설명합니다.",
      image: "/images/hero-bg.webp",
      imageAlt: "약속 장소에서 바이크 상태와 서류를 확인하는 단계",
      imagePosition: "65% center",
    },
    {
      number: "04",
      title: "입금·상차",
      description:
        "최종 금액과 계약 내용을 함께 확인한 뒤 판매대금을 계좌로 전액 이체합니다. 판매자가 입금을 확인하면 차량을 상차합니다.",
      image: "/images/hero-bg.webp",
      imageAlt: "판매대금 입금 확인 뒤 바이크를 상차하는 단계",
      imagePosition: "82% center",
    },
  ] satisfies readonly ProcessStep[],
  faq: [
    {
      question: "사진만으로 최종 금액을 확정할 수 있나요?",
      answer:
        "사진으로 드리는 금액은 예상 견적입니다. 현장에서 외관과 시동·주행 상태, 소모품, 서류를 살핀 뒤 최종 금액을 설명합니다. 달라진 부분이 있다면 차량을 싣기 전에 먼저 말씀드립니다.",
    },
    {
      question: "바이크를 먼저 보내야 하나요?",
      answer:
        "아닙니다. 직접 방문해 판매자와 함께 차량을 확인합니다. 계약과 입금을 확인한 뒤 상차합니다.",
    },
    {
      question: "24시간 바로 방문할 수 있나요?",
      answer:
        "24시간은 문의를 남길 수 있다는 뜻입니다. 방문 시간은 지역, 교통, 당일 일정을 확인한 뒤 안내합니다.",
    },
    {
      question: "개인 거래보다 더 받을 수 있나요?",
      answer:
        "개인 거래가 가격 면에서는 더 유리할 수 있습니다. 업체 매입은 문의부터 현장 검수, 계약, 입금, 상차까지 한 번에 진행해 시간을 줄이는 방식입니다.",
    },
    {
      question: "번호판이 있거나 폐지 전이어도 상담할 수 있나요?",
      answer:
        "네, 상담 가능합니다. 등록 상태와 본인 소유 여부, 준비할 서류를 먼저 확인하고 가능한 절차를 알려드립니다.",
    },
    {
      question: "현장에서 금액이 달라질 수 있나요?",
      answer:
        "사진에서 확인하기 어려운 사고 흔적, 고장, 서류 상태 등이 있으면 달라질 수 있습니다. 달라지는 이유와 최종 금액을 설명하고, 판매자가 동의한 뒤에만 거래합니다.",
    },
  ] satisfies readonly FaqItem[],
} as const;
