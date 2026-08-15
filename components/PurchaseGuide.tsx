import { ChevronDown } from "lucide-react";

import { site } from "@/content/site";

export default function PurchaseGuide() {
  return (
    <section className="section section--paper purchase-guide" aria-labelledby="guide-title">
      <div className="site-shell purchase-guide__inner">
        <div className="section-heading section-heading--left">
          <p>{site.purchaseGuide.eyebrow}</p>
          <h2 id="guide-title">{site.purchaseGuide.title}</h2>
          <span>{site.purchaseGuide.description}</span>
        </div>

        <details className="purchase-guide__details">
          <summary>
            <span>{site.purchaseGuide.disclosure.summary}</span>
            <ChevronDown aria-hidden="true" size={21} />
          </summary>
          <p>{site.purchaseGuide.disclosure.answer}</p>
        </details>
      </div>
    </section>
  );
}
