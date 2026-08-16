"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Phone } from "lucide-react";

import { site } from "@/content/site";

export default function StickyInquiryBar() {
  const barRef = useRef<HTMLElement>(null);
  const [heroPassed, setHeroPassed] = useState(false);
  const [processVisible, setProcessVisible] = useState(false);
  const [faqVisible, setFaqVisible] = useState(false);
  const [finalVisible, setFinalVisible] = useState(false);

  useEffect(() => {
    const hero = document.querySelector<HTMLElement>("[data-testid='hero']");
    const process = document.querySelector<HTMLElement>("[data-testid='visit-flow']");
    const faq = document.querySelector<HTMLElement>("#faq");
    const finalCta = document.querySelector<HTMLElement>("[data-testid='final-cta']");
    if (!hero || !process || !faq || !finalCta) return;

    const moveFocusTo = (destination: HTMLElement, previousDestination?: HTMLElement) => {
      const activeElement = document.activeElement;
      if (!barRef.current?.contains(activeElement) && activeElement !== previousDestination) return;

      const previousTabIndex = destination.getAttribute("tabindex");
      const restoreTabIndex = () => {
        if (previousTabIndex === null) destination.removeAttribute("tabindex");
        else destination.setAttribute("tabindex", previousTabIndex);
      };
      destination.tabIndex = -1;
      destination.addEventListener("blur", restoreTabIndex, { once: true });
      destination.focus({ preventScroll: true });
      if (document.activeElement !== destination) restoreTabIndex();
    };

    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        setHeroPassed(!entry.isIntersecting && entry.boundingClientRect.bottom <= 0);
      },
      { threshold: 0 },
    );
    const processObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) moveFocusTo(process);
        setProcessVisible(entry.isIntersecting);
      },
      { threshold: 0 },
    );
    const finalObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) moveFocusTo(finalCta, faq);
        setFinalVisible(entry.isIntersecting);
      },
      { threshold: 0.1 },
    );
    const faqObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) moveFocusTo(faq);
        setFaqVisible(entry.isIntersecting);
      },
      { threshold: 0 },
    );

    heroObserver.observe(hero);
    processObserver.observe(process);
    faqObserver.observe(faq);
    finalObserver.observe(finalCta);

    return () => {
      heroObserver.disconnect();
      processObserver.disconnect();
      faqObserver.disconnect();
      finalObserver.disconnect();
    };
  }, []);

  const visible = heroPassed && !processVisible && !faqVisible && !finalVisible;
  const kakao = site.contact.stickyKakao;

  return (
    <aside
      ref={barRef}
      className={`sticky-inquiry${visible ? " is-visible" : ""}`}
      data-testid="sticky-inquiry"
      aria-label="빠른 문의"
      aria-hidden={!visible}
      inert={!visible}
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
