import { MessageCircle, Phone } from "lucide-react";

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
            className="header-kakao"
            href={site.links.kakao}
            target="_blank"
            rel="noreferrer"
            aria-label="카카오톡으로 문의하기"
          >
            <MessageCircle aria-hidden="true" size={18} />
            <span>카카오톡</span>
          </a>
          <a className="header-phone" href={phone.href} data-cta={phone.ctaId}>
            <Phone aria-hidden="true" size={17} />
            <span className="header-phone__hours">{phone.label}</span>
            <span>{site.phone.display}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
