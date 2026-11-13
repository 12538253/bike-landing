import type { Metadata } from "next";

import InformationPage from "@/components/InformationPage";
import { site } from "@/content/site";

const page = site.informationPages.about;
const url = `${site.canonicalUrl}${page.path}`;

export const metadata: Metadata = {
  title: `${page.title} | 인천, 서울, 경기 방문 매입`,
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

export default function About() {
  return (
    <InformationPage page={page}>
      <section aria-labelledby="about-business">
        <h2 id="about-business">인천에 매장이 있습니다. 약속한 장소로 찾아갑니다.</h2>
        <p>{site.business.description}</p>
        <dl className="information-facts">
          <div><dt>상호명</dt><dd>{site.name}</dd></div>
          <div><dt>대표자명</dt><dd>{site.business.owner}</dd></div>
          <div><dt>사업자등록번호</dt><dd>{site.business.registrationNumber}</dd></div>
          <div><dt>매장 주소</dt><dd><address>{site.address.full}</address></dd></div>
          <div><dt>대표 연락처</dt><dd><a href={site.phone.href}>{site.phone.display}</a></dd></div>
          <div><dt>방문 매입 지역</dt><dd>{site.serviceAreas.join(", ")}</dd></div>
          <div><dt>문의와 매장 방문</dt><dd>{site.locationSection.hours}</dd></div>
        </dl>
      </section>
      <section aria-labelledby="about-deal">
        <h2 id="about-deal">사진 상담부터 현장 거래까지</h2>
        <p>{site.hero.description}</p>
        <p>{site.supportSection.description}</p>
        <a className="information-text-link" href={site.informationPages.visitPurchase.path}>방문 매입 순서와 견적 준비 알아보기 →</a>
      </section>
      <section aria-labelledby="about-records">
        <h2 id="about-records">공식 블로그에서 확인하는 실제 매입 사례</h2>
        <p>서울 은평구, 인천 부평, 부천에서 진행한 매입 기록입니다. 차량 사진과 거래 내용은 각 원문에서 확인해 보세요.</p>
        <ul className="information-records">
          {site.cases.map((record) => (
            <li key={record.sourceUrl}>
              <p className="information-eyebrow">{record.region}</p>
              <h3>{record.model}</h3>
              <p>{record.proof}</p>
              <a className="information-text-link" href={record.sourceUrl} target="_blank" rel="noreferrer">{record.model} 매입 원문 보기 ↗</a>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="about-channels">
        <h2 id="about-channels">바이크매니저 공식 채널</h2>
        <p>매장 위치와 리뷰는 네이버 플레이스에서, 실제 매입 기록은 공식 블로그에서 확인하세요. 사진 상담은 카카오톡으로 문의해 주세요.</p>
        <ul className="information-channels">
          <li><a href={site.links.naverPlace} target="_blank" rel="noreferrer">네이버 플레이스에서 위치와 리뷰 ↗</a></li>
          <li><a href={site.links.officialBlog} target="_blank" rel="noreferrer">공식 블로그에서 매입 기록 ↗</a></li>
          <li><a href={site.links.kakaoChannel} target="_blank" rel="noreferrer">카카오톡 공식 채널 ↗</a></li>
        </ul>
      </section>
    </InformationPage>
  );
}
