import { ChevronDown } from "lucide-react";

import { site } from "@/content/site";

export default function FAQSection() {
  return (
    <section className="section section--paper" id="faq" aria-labelledby="faq-title">
      <div className="site-shell faq-layout">
        <div className="section-heading section-heading--left faq-heading">
          <p>자주 묻는 질문</p>
          <h2 id="faq-title">문의할 때 많이 묻는 내용입니다</h2>
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
