import { ArrowUpRight, BookOpenText, MapPinned, MessageSquareText } from "lucide-react";

import { site } from "@/content/site";

export default function NaverProof() {
  const naver = site.contact.naverProof;

  return (
    <section className="section section--naver" aria-labelledby="naver-title">
      <div className="site-shell naver-proof">
        <div className="naver-proof__mark" aria-hidden="true">
          N
        </div>
        <div className="naver-proof__content">
          <div className="section-heading section-heading--left">
            <p>말보다 실제 기록을 확인해 주세요</p>
            <h2 id="naver-title">위치와 리뷰, 매입 기록을 네이버에서 바로 확인하세요</h2>
            <span>
              매장 위치와 방문자 리뷰는 네이버 플레이스에서, 실제 매입 과정과 차량 사진은 공식
              블로그에서 확인해 주세요.
            </span>
          </div>
          <div className="naver-proof__facts" aria-label="네이버에서 확인할 수 있는 정보">
            <span>
              <MapPinned aria-hidden="true" size={19} /> 매장 위치
            </span>
            <span>
              <MessageSquareText aria-hidden="true" size={19} /> 방문자 리뷰
            </span>
            <span>
              <BookOpenText aria-hidden="true" size={19} /> 공식 매입 사례
            </span>
          </div>
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
        </div>
      </div>
    </section>
  );
}
