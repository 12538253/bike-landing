import { ArrowUpRight, MapPin, MessageCircle, Phone } from "lucide-react";

import { site } from "@/content/site";

export default function LocationFinal() {
  const phone = site.contact.finalPhone;

  return (
    <section className="final-section" id="contact" data-testid="final-cta" aria-labelledby="final-title">
      <div className="final-section__grid" aria-hidden="true" />
      <div className="site-shell final-section__inner">
        <div className="final-location">
          <span className="final-location__icon">
            <MapPin aria-hidden="true" size={25} />
          </span>
          <p>{site.locationSection.storeLabel}</p>
          <address>{site.address.short}</address>
          <span>{site.locationSection.hours}</span>
          <a href={site.locationSection.mapLink.href} target="_blank" rel="noreferrer">
            {site.locationSection.mapLink.label} <ArrowUpRight aria-hidden="true" size={17} />
          </a>
        </div>

        <div className="final-copy">
          <p>{site.locationSection.eyebrow}</p>
          <h2 id="final-title">{site.locationSection.title}</h2>
          <div className="final-copy__actions">
            <a
              className="button button--primary"
              href={site.contact.heroKakao.href}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle aria-hidden="true" size={20} />
              {site.contact.heroKakao.label}
            </a>
            <a className="button button--ghost" href={phone.href} data-cta={phone.ctaId}>
              <Phone aria-hidden="true" size={19} />
              {phone.label}
            </a>
          </div>
          <a className="final-copy__phone" href={site.phone.href}>
            {site.phone.display}
          </a>
        </div>
      </div>
    </section>
  );
}
