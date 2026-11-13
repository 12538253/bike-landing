import type { ReactNode } from "react";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { site } from "@/content/site";

type Information = (typeof site.informationPages)[keyof typeof site.informationPages];

export default function InformationPage({ page, children }: Readonly<{
  page: Information;
  children: ReactNode;
}>) {
  return (
    <div className="site-page information-page">
      <Header home={false} />
      <main id="top" className="site-shell information-main">
        <nav className="information-breadcrumb" aria-label="현재 위치">
          {/* Full navigation reinitializes the existing page-scoped contact observers. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/">홈</a><span aria-hidden="true">/</span><span aria-current="page">{page.label}</span>
        </nav>
        <header className="information-heading">
          <p className="information-eyebrow">BIKE MANAGER · {page.label}</p>
          <h1>{page.title}</h1>
          <p>{page.description}</p>
        </header>
        <article className="information-body">{children}</article>
        <section className="information-contact" aria-labelledby="information-contact-title">
          <div>
            <p className="information-eyebrow">사진으로 먼저 상담하세요</p>
            <h2 id="information-contact-title">예상 견적과 방문 일정을 확인하세요.</h2>
            <p>{site.locationSection.hours}</p>
          </div>
          <div className="information-actions">
            <a className="button button--primary" href={site.links.kakao} target="_blank" rel="noreferrer">
              카카오톡으로 사진 보내기
            </a>
            <a className="button button--ghost" href={site.phone.href}>전화 상담 {site.phone.display}</a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
