import { Check } from "lucide-react";

import { site } from "@/content/site";

export default function QuoteChecklist() {
  return (
    <section className="section section--paper" data-testid="quote-checklist" aria-labelledby="quote-title">
      <div className="site-shell quote-layout">
        <div className="quote-layout__content">
          <div className="section-heading section-heading--left">
            <p>{site.quoteSection.eyebrow}</p>
            <h2 id="quote-title">{site.quoteSection.title}</h2>
            <span>{site.quoteSection.description}</span>
          </div>
          <ul className="quote-list">
            {site.quoteSection.items.map((item, index) => (
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
