import { ChevronDown } from "lucide-react";

import { site } from "@/content/site";

export default function SupportSection() {
  const support = site.supportSection;

  return (
    <section className="section section--paper support-section" id="faq" aria-labelledby="faq-title">
      <div className="site-shell support-layout">
        <div className="section-heading section-heading--left support-heading">
          <p>{support.eyebrow}</p>
          <h2 id="faq-title">{support.title}</h2>
          <span>{support.description}</span>
        </div>
        <div className="support-list">
          <details className="support-list__documents">
            <summary>
              <span>{support.disclosure.summary}</span>
              <ChevronDown aria-hidden="true" size={21} />
            </summary>
            <div className="support-answer">
              <p>{support.disclosure.answer}</p>
            </div>
          </details>
          {support.items.map((item) => (
            <details key={item.question}>
              <summary>
                <span>{item.question}</span>
                <ChevronDown aria-hidden="true" size={21} />
              </summary>
              <div className="support-answer">
                <p>{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
