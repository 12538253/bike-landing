import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { site } from "@/content/site";

export default function CaseStudies() {
  return (
    <section className="section section--ink" id="cases" aria-labelledby="cases-title">
      <div className="site-shell">
        <div className="section-heading section-heading--light">
          <p>실제 매입 사례</p>
          <h2 id="cases-title">공식 블로그에 남긴 현장 기록입니다</h2>
          <span>
            방문 매입 과정을 공식 블로그에 기록했습니다. 당시 차량 사진과 진행 내용은 각 원문에서
            확인할 수 있습니다.
          </span>
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
                    sizes="(max-width: 760px) 100vw, 33vw"
                    style={{ objectPosition: caseStudy.imagePosition }}
                  />
                </div>
                <div className="case-card__overlay" />
                <div className="case-card__content">
                  <span className="case-card__source">공식 블로그 사례</span>
                  <p>{caseStudy.region}</p>
                  <h3>{caseStudy.model}</h3>
                  <span className="case-card__summary">{caseStudy.summary}</span>
                  <span className="case-card__link">
                    <span className="sr-only">{caseStudy.sourceLabel}. </span>
                    원문과 사진 보기 <ArrowUpRight aria-hidden="true" size={17} />
                  </span>
                </div>
              </a>
            </article>
          ))}
        </div>
        <p className="case-disclaimer">
          카드 이미지는 공식 블로그에 게시된 실제 매입 사진입니다. 카드를 누르면 당시 기록을 확인할 수
          있습니다.
        </p>
      </div>
    </section>
  );
}
