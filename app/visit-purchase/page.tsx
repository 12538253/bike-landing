import type { Metadata } from "next";

import InformationPage from "@/components/InformationPage";
import { site } from "@/content/site";

const page = site.informationPages.visitPurchase;
const url = `${site.canonicalUrl}${page.path}`;

export const metadata: Metadata = {
  title: `${page.title} | ${site.name}`,
  description: page.description,
  alternates: { canonical: url },
  openGraph: {
    title: page.title,
    description: page.description,
    url,
    siteName: site.name,
    images: [site.metadata.ogImage],
    locale: "ko_KR",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: page.title, description: page.description, images: [site.metadata.ogImage] },
};

export default function VisitPurchase() {
  return (
    <InformationPage page={page}>
      <section aria-labelledby="purchase-area">
        <h2 id="purchase-area">인천, 서울, 경기에서 오토바이를 팔려면 어떻게 하나요?</h2>
        <p>바이크매니저는 인천, 서울, 경기에서 중고 오토바이를 직접 방문해 매입합니다. 기종과 차량 상태, 지역을 알려주시면 사진으로 예상 견적과 방문 가능한 시간을 먼저 안내합니다.</p>
        <p>방문 장소와 시간은 상담 후 정합니다. 스쿠터부터 대형 바이크까지 차량 상태와 등록 정보를 확인해 매입 가능 여부를 안내합니다.</p>
      </section>
      <section aria-labelledby="purchase-prepare">
        <h2 id="purchase-prepare">견적 문의 전에 무엇을 준비하나요?</h2>
        <p>{site.quoteSection.description} 견적을 문의하실 때는 아래 정보를 함께 보내주세요.</p>
        <ul className="information-checklist">
          {site.quoteSection.items.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
      <section aria-labelledby="purchase-steps">
        <h2 id="purchase-steps">방문 매입은 어떤 순서로 진행되나요?</h2>
        <ol className="information-steps">
          <li><h3>사진 상담과 예상 견적</h3><p>{site.visitFlow.stages.photoGuide.description}</p></li>
          <li><h3>방문 일정 조율</h3><p>{site.supportSection.items[1].answer}</p></li>
          <li><h3>차량 확인과 최종 금액 합의</h3><p>{site.supportSection.items[0].answer}</p></li>
          <li><h3>판매대금 전액 입금 확인 후 상차</h3><p>{site.visitFlow.stages.onsiteDeal.description}</p></li>
        </ol>
      </section>
      <section aria-labelledby="purchase-comparison">
        <h2 id="purchase-comparison">개인 거래와 업체 매입 중 무엇이 맞을까요?</h2>
        <p>{site.supportSection.items[2].answer}</p>
        <p>{site.visitFlow.safety.answer}</p>
      </section>
      <section aria-labelledby="purchase-contact">
        <h2 id="purchase-contact">어디로 문의하면 되나요?</h2>
        <p>차량 사진은 카카오톡으로 보내주세요. 전화 상담은 <a className="information-text-link" href={site.phone.href}>{site.phone.display}</a>로 연락해 주세요.</p>
        <p>인천 오프라인 매장은 {site.address.full}에 있습니다. 매장 방문 전에는 먼저 연락해 주세요.</p>
        <a className="information-text-link" href={site.informationPages.about.path}>업체 소개와 공식 채널 확인하기 →</a>
      </section>
    </InformationPage>
  );
}
