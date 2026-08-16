import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { site } from "@/content/site";

const caseImageSizes = {
  featured: "(max-width: 760px) 100vw, 420px",
  portrait: "(max-width: 760px) 50vw, 300px",
} satisfies Record<(typeof site.cases)[number]["layout"], string>;

export default function CaseStudies() {
  return (
    <section className="section section--ink" id="cases" aria-labelledby="cases-title">
      <div className="site-shell">
        <div className="section-heading section-heading--light">
          <p>{site.caseStudySection.eyebrow}</p>
          <h2 id="cases-title">{site.caseStudySection.title}</h2>
        </div>

        <div className="case-grid">
          {site.cases.map((caseStudy) => (
            <article
              className={`case-card case-card--${caseStudy.layout}`}
              key={`${caseStudy.region}-${caseStudy.model}`}
            >
              <div className="case-card__media">
                <Image
                  src={caseStudy.image}
                  alt={caseStudy.imageAlt}
                  fill
                  sizes={caseImageSizes[caseStudy.layout]}
                  style={{ objectPosition: caseStudy.imagePosition }}
                />
              </div>
              <div className="case-card__content">
                <p>{caseStudy.region}</p>
                <h3>{caseStudy.model}</h3>
                <span className="case-card__proof">{caseStudy.proof}</span>
                <a className="case-card__link" href={caseStudy.sourceUrl} target="_blank" rel="noreferrer">
                  <span className="sr-only">{caseStudy.sourceLabel}. </span>
                  {site.caseStudySection.cardLinkLabel} <ArrowUpRight aria-hidden="true" size={17} />
                </a>
              </div>
            </article>
          ))}
        </div>
        <div className="case-links">
          <a
            href={site.caseStudySection.indexLink.href}
            data-cta={site.caseStudySection.indexLink.ctaId}
            target="_blank"
            rel="noreferrer"
          >
            {site.caseStudySection.indexLink.label} <ArrowUpRight aria-hidden="true" size={17} />
          </a>
          <a href={site.caseStudySection.placeLink.href} target="_blank" rel="noreferrer">
            {site.caseStudySection.placeLink.label} <ArrowUpRight aria-hidden="true" size={17} />
          </a>
        </div>
      </div>
    </section>
  );
}
