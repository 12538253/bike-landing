import { ArrowUpRight, BookOpenText, Camera, MapPinned, RefreshCw } from "lucide-react";

import { site } from "@/content/site";

export default function NaverProof() {
  const naver = site.contact.naverProof;

  return (
    <section className="section section--naver" aria-labelledby="naver-title">
      <div className="site-shell naver-proof">
        <div className="naver-proof__mark" aria-hidden="true">
          <BookOpenText size={31} strokeWidth={1.7} />
        </div>
        <div className="naver-proof__content">
          <div className="section-heading section-heading--left">
            <p>말보다 실제 기록을 확인해 주세요</p>
            <h2 id="naver-title">공식 블로그에서 실제 매입 기록을 확인하세요</h2>
            <span>
              바이크매니저가 직접 운영하는 블로그에 지역별 매입 과정과 차량 사진을 계속 기록하고
              있습니다. 매장 정보와 방문자 리뷰는 별도의 플레이스 링크에서 확인할 수 있습니다.
            </span>
          </div>
          <div className="naver-proof__facts" aria-label="공식 블로그에서 확인할 수 있는 정보">
            <span>
              <MapPinned aria-hidden="true" size={19} /> 지역별 방문 기록
            </span>
            <span>
              <Camera aria-hidden="true" size={19} /> 실제 차량 사진
            </span>
            <span>
              <RefreshCw aria-hidden="true" size={19} /> 계속 업데이트되는 사례
            </span>
          </div>
          <div className="naver-proof__actions">
            <a
              className="button button--naver"
              href={naver.href}
              data-cta={naver.ctaId}
              target="_blank"
              rel="noreferrer"
            >
              {naver.label}
              <ArrowUpRight aria-hidden="true" size={18} />
            </a>
            <a
              className="naver-proof__place-link"
              href={site.links.naverPlace}
              target="_blank"
              rel="noreferrer"
            >
              네이버 플레이스에서 업체 정보·리뷰 보기
              <ArrowUpRight aria-hidden="true" size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
