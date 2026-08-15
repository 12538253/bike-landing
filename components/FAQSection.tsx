import { ChevronDown } from "lucide-react";

import { site } from "@/content/site";

export default function FAQSection() {
  return (
    <section className="section section--paper" id="faq" aria-labelledby="faq-title">
      <div className="site-shell faq-layout">
        <div className="section-heading section-heading--left faq-heading">
          <p>자주 묻는 질문</p>
          <h2 id="faq-title">문의 전에 궁금한 점부터 확인하세요</h2>
          <span>답이 더 필요하다면 차량 사진과 함께 카카오톡으로 편하게 물어보세요.</span>
        </div>
        <div className="faq-list">
          {site.faq.map((item) => (
            <details key={item.question}>
              <summary>
                <span>{item.question}</span>
                <ChevronDown aria-hidden="true" size={21} />
              </summary>
              <div className="faq-answer">
                <p>{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
