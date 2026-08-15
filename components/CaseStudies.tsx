import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { site } from "@/content/site";

const caseImageSizes = {
  featured: "(max-width: 760px) 100vw, (max-width: 1119px) 67vw, 50vw",
  portrait: "(max-width: 760px) 100vw, (max-width: 1119px) 33vw, 25vw",
} satisfies Record<(typeof site.cases)[number]["layout"], string>;

export default function CaseStudies() {
  return (
    <section className="section section--ink" id="cases" aria-labelledby="cases-title">
      <div className="site-shell">
        <div className="section-heading section-heading--light">
          <p>실제 매입 사례</p>
          <h2 id="cases-title">실제 매입 사진과 기록을 확인하세요</h2>
          <span>당시 차량 사진과 진행 내용은 각 원문에서 확인할 수 있습니다.</span>
        </div>

        <div className="case-grid">
          {site.cases.map((caseStudy) => (
            <article
              className={`case-card case-card--${caseStudy.layout}`}
              key={`${caseStudy.region}-${caseStudy.model}`}
            >
              <a
                href={caseStudy.sourceUrl}
                target="_blank"
                rel="noreferrer"
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
                <div className="case-card__overlay" />
                <div className="case-card__content">
                  <p>{caseStudy.region}</p>
                  <h3>{caseStudy.model}</h3>
                  {caseStudy.summary ? (
                    <span className="case-card__summary">{caseStudy.summary}</span>
                  ) : null}
                  <span className="case-card__link">
                    <span className="sr-only">{caseStudy.sourceLabel}. </span>
                    원문 보기 <ArrowUpRight aria-hidden="true" size={17} />
                  </span>
                </div>
              </a>
            </article>
          ))}
        </div>
        <div className="case-links">
          <a
            href={site.contact.naverProof.href}
            data-cta={site.contact.naverProof.ctaId}
            target="_blank"
            rel="noreferrer"
          >
            {site.contact.naverProof.label} <ArrowUpRight aria-hidden="true" size={17} />
          </a>
          <a href={site.links.naverPlace} target="_blank" rel="noreferrer">
            네이버 플레이스·리뷰 보기 <ArrowUpRight aria-hidden="true" size={17} />
          </a>
        </div>
      </div>
    </section>
  );
}
