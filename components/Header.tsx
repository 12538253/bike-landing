import { Phone } from "lucide-react";

import { site } from "@/content/site";

export default function Header() {
  const phone = site.contact.headerPhone;

  return (
    <header className="site-header">
      <div className="site-shell site-header__inner">
        <a className="brand-mark" href="#top">
          <span className="brand-mark__badge" aria-hidden="true">
            BM
          </span>
          <span className="brand-mark__copy">
            <span className="brand-mark__name">{site.name}</span>
            <span className="brand-mark__english">{site.englishName}</span>
          </span>
          <span className="sr-only">홈</span>
        </a>

        <nav className="site-nav" aria-label="주요 메뉴">
          {site.navigation.map((item) => (
            <a href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="site-header__actions">
          <a
            className="header-phone"
            href={phone.href}
            data-cta={phone.ctaId}
            aria-label={`${phone.label} ${site.phone.display}`}
          >
            <Phone aria-hidden="true" size={17} />
            <span>{phone.label}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
