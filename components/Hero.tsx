import { ArrowDown, MessageCircle, Phone } from "lucide-react";

import { site } from "@/content/site";

export default function Hero() {
  const kakao = site.contact.heroKakao;

  return (
    <section className="hero" id="top" data-testid="hero">
      <div className="hero__media" data-testid="hero-media" aria-hidden="true">
        <picture>
          <source media="(max-width: 760px)" srcSet="/images/hero-mobile.webp" type="image/webp" />
          {/* The static picture element lets mobile download a smaller, art-directed LCP asset. */}
          <img
            src="/images/hero-bg.webp"
            alt=""
            width="1440"
            height="900"
            decoding="async"
            fetchPriority="high"
            className="hero__image"
          />
        </picture>
      </div>
      <div className="hero__shade" aria-hidden="true" />
      <div className="site-shell hero__inner">
        <div className="hero__copy" data-testid="hero-copy">
          <p className="hero__eyebrow">{site.hero.eyebrow}</p>
          <h1>
            {site.hero.titleLines.map((line, index) => (
              <span className="hero__title-line" key={line}>
                {line}
                {index < site.hero.titleLines.length - 1 ? " " : null}
              </span>
            ))}
          </h1>
          <p className="hero__description">{site.hero.description}</p>

          <div className="hero__actions">
            <a
              className="button button--primary"
              href={kakao.href}
              data-cta={kakao.ctaId}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle aria-hidden="true" size={20} />
              {kakao.label}
            </a>
            <a className="button button--ghost" href={site.contact.finalPhone.href}>
              <Phone aria-hidden="true" size={19} />
              {site.contact.finalPhone.label}
            </a>
          </div>

          <p className="hero__note">{site.hero.note}</p>
        </div>

        <a className="hero__scroll" href="#process">
          <span>{site.hero.scrollLabel}</span>
          <ArrowDown aria-hidden="true" size={18} />
        </a>
      </div>
    </section>
  );
}
