import { Camera, Check } from "lucide-react";

import { site } from "@/content/site";

export default function QuoteChecklist() {
  return (
    <section className="section section--paper" data-testid="quote-checklist" aria-labelledby="quote-title">
      <div className="site-shell quote-layout">
        <div className="section-kicker">
          <Camera aria-hidden="true" size={20} />
          견적 준비
        </div>
        <div className="quote-layout__content">
          <div className="section-heading section-heading--left">
            <p>사진과 기본 정보만 준비해 주세요</p>
            <h2 id="quote-title">처음 문의할 때 이 여덟 가지가 필요합니다</h2>
            <span>
              차량은 밝은 곳에서 전체 모습과 하자 부위를 가까이 찍어주세요. 정보와 사진을 함께
              보내주시면 예상 견적을 안내하는 데 도움이 됩니다.
            </span>
          </div>
          <ul className="quote-list">
            {site.quoteItems.map((item, index) => (
              <li key={item}>
                <span className="quote-list__number">{String(index + 1).padStart(2, "0")}</span>
                <span>{item}</span>
                <Check aria-hidden="true" size={18} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
