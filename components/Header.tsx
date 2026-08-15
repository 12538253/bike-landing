import { MessageCircle, Phone } from "lucide-react";

import { site } from "@/content/site";

export default function Header() {
  const phone = site.contact.headerPhone;

  return (
    <header className="site-header">
      <div className="site-shell site-header__inner">
        <a className="brand-mark" href="#top">
          <span className="sr-only">바이크매니저 홈</span>
          <span className="brand-mark__badge" aria-hidden="true">
            BM
          </span>
          <span className="brand-mark__name">{site.englishName}</span>
        </a>

        <nav className="site-nav" aria-label="주요 메뉴">
          <a href="#cases">매입 사례</a>
          <a href="#process">거래 절차</a>
          <a href="#faq">자주 묻는 질문</a>
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
            <span className="header-phone__hours">24시간 문의</span>
            <span>{site.phone.display}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
