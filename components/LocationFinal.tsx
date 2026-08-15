import { ArrowUpRight, MapPin, MessageCircle, Phone } from "lucide-react";

import { site } from "@/content/site";

export default function LocationFinal() {
  const phone = site.contact.finalPhone;

  return (
    <section className="final-section" id="contact" data-testid="final-cta" aria-labelledby="final-title">
      <div className="final-section__grid" aria-hidden="true" />
      <div className="site-shell final-section__inner">
        <div className="final-location">
          <span className="final-location__icon">
            <MapPin aria-hidden="true" size={25} />
          </span>
          <p>인천 오프라인 매장</p>
          <address>{site.address.short}</address>
          <span>24시간 문의 가능 · 방문 전 연락</span>
          <a href={site.links.naverPlace} target="_blank" rel="noreferrer">
            네이버 지도에서 위치 보기 <ArrowUpRight aria-hidden="true" size={17} />
          </a>
        </div>

        <div className="final-copy">
          <p>사진으로 먼저 확인해 보세요</p>
          <h2 id="final-title">바이크 사진을 보내주시면 예상 견적과 방문 가능 시간을 안내합니다</h2>
          <div className="final-copy__actions">
            <a
              className="button button--primary"
              href={site.links.kakao}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle aria-hidden="true" size={20} />
              카카오톡으로 사진 보내기
            </a>
            <a className="button button--ghost" href={phone.href} data-cta={phone.ctaId}>
              <Phone aria-hidden="true" size={19} />
              {phone.label}
            </a>
          </div>
          <a className="final-copy__phone" href={site.phone.href}>
            {site.phone.display}
          </a>
        </div>
      </div>
    </section>
  );
}
