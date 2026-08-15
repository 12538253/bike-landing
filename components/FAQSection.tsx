import { ChevronDown } from "lucide-react";

import { site } from "@/content/site";

export default function FAQSection() {
  return (
    <section className="section section--paper" id="faq" aria-labelledby="faq-title">
      <div className="site-shell faq-layout">
        <div className="section-heading section-heading--left faq-heading">
          <p>{site.faqSection.eyebrow}</p>
          <h2 id="faq-title">{site.faqSection.title}</h2>
        </div>
        <div className="faq-list">
          {site.faqSection.items.map((item) => (
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
