"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Phone } from "lucide-react";

import { site } from "@/content/site";

export default function StickyInquiryBar() {
  const [heroPassed, setHeroPassed] = useState(false);
  const [processVisible, setProcessVisible] = useState(false);
  const [finalVisible, setFinalVisible] = useState(false);

  useEffect(() => {
    const hero = document.querySelector<HTMLElement>("[data-testid='hero']");
    const process = document.querySelector<HTMLElement>("[data-testid='transaction-paths']");
    const finalCta = document.querySelector<HTMLElement>("[data-testid='final-cta']");
    if (!hero || !process || !finalCta) return;

    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        setHeroPassed(!entry.isIntersecting && entry.boundingClientRect.bottom <= 0);
      },
      { threshold: 0 },
    );
    const processObserver = new IntersectionObserver(
      ([entry]) => setProcessVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    const finalObserver = new IntersectionObserver(
      ([entry]) => setFinalVisible(entry.isIntersecting),
      { threshold: 0.1 },
    );

    heroObserver.observe(hero);
    processObserver.observe(process);
    finalObserver.observe(finalCta);

    return () => {
      heroObserver.disconnect();
      processObserver.disconnect();
      finalObserver.disconnect();
    };
  }, []);

  const visible = heroPassed && !processVisible && !finalVisible;
  const kakao = site.contact.stickyKakao;

  return (
    <aside
      className={`sticky-inquiry${visible ? " is-visible" : ""}`}
      data-testid="sticky-inquiry"
      aria-label="빠른 문의"
      aria-hidden={!visible}
    >
      <a href={site.phone.href} tabIndex={visible ? 0 : -1}>
        <Phone aria-hidden="true" size={20} />
        전화 상담
      </a>
      <a
        href={kakao.href}
        data-cta={kakao.ctaId}
        target="_blank"
        rel="noreferrer"
        tabIndex={visible ? 0 : -1}
      >
        <MessageCircle aria-hidden="true" size={20} />
        카카오톡
      </a>
    </aside>
  );
}
