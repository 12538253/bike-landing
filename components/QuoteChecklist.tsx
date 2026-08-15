import { Check } from "lucide-react";

import { site } from "@/content/site";

export default function QuoteChecklist() {
  return (
    <section className="section section--paper" data-testid="quote-checklist" aria-labelledby="quote-title">
      <div className="site-shell quote-layout">
        <div className="quote-layout__content">
          <div className="section-heading section-heading--left">
            <p>견적 준비</p>
            <h2 id="quote-title">사진과 8가지 정보만 보내주세요</h2>
            <span>밝은 곳에서 전체 모습과 하자 부위를 가까이 찍어주세요.</span>
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
