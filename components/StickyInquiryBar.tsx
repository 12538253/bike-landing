"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Phone } from "lucide-react";

import { site } from "@/content/site";

export default function StickyInquiryBar() {
  const barRef = useRef<HTMLElement>(null);
  const [heroActionsVisible, setHeroActionsVisible] = useState(true);
  const [contentObstacleOverlaps, setContentObstacleOverlaps] = useState(false);
  const [finalVisible, setFinalVisible] = useState(false);

  useEffect(() => {
    const heroActions = document.querySelector<HTMLElement>("[data-testid='hero-actions']");
    const main = document.querySelector<HTMLElement>("main");
    const finalCta = document.querySelector<HTMLElement>("[data-testid='final-cta']");
    if (!heroActions || !main || !finalCta) return;

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

    const heroActionsObserver = new IntersectionObserver(
      ([entry]) => {
        setHeroActionsVisible(entry.isIntersecting);
      },
      { threshold: 0 },
    );
    const finalObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) moveFocusTo(finalCta);
        setFinalVisible(entry.isIntersecting);
      },
      { threshold: 0.1 },
    );
    let contentObstacleIsOverlapping = false;
    const updateContentObstacleOverlap = () => {
      const bar = barRef.current;
      if (!bar) return;

      const contentObstacles = [...main.querySelectorAll<HTMLElement>(
        "a[href], button, summary, details[open] .support-answer",
      )].filter((element) => !element.closest("[data-testid='hero']") && !element.closest("[data-testid='final-cta']"));
      const styles = window.getComputedStyle(bar);
      const bottom = Number.parseFloat(styles.bottom) || 0;
      const barRect = bar.getBoundingClientRect();
      const visibleBarTop = window.innerHeight - bottom - bar.offsetHeight;
      const visibleBarBottom = window.innerHeight - bottom;
      const visibleBarLeft = barRect.left;
      const visibleBarRight = barRect.right;
      const overlappingObstacle = contentObstacles.find((element) => {
        const rect = element.getBoundingClientRect();
        const elementStyles = window.getComputedStyle(element);
        return elementStyles.display !== "none" && elementStyles.visibility !== "hidden"
          && rect.width > 0 && rect.height > 0
          && rect.right > visibleBarLeft && rect.left < visibleBarRight
          && rect.bottom > visibleBarTop && rect.top < visibleBarBottom;
      });
      const overlaps = Boolean(overlappingObstacle);
      if (overlappingObstacle && !contentObstacleIsOverlapping) {
        const destination = overlappingObstacle.closest<HTMLElement>("section[id]") ?? overlappingObstacle;
        moveFocusTo(destination);
      }
      contentObstacleIsOverlapping = overlaps;
      setContentObstacleOverlaps(overlaps);
    };
    let toggleFrame: number | null = null;
    const updateAfterToggle = () => {
      if (toggleFrame !== null) window.cancelAnimationFrame(toggleFrame);
      toggleFrame = window.requestAnimationFrame(() => {
        toggleFrame = null;
        updateContentObstacleOverlap();
      });
    };

    heroActionsObserver.observe(heroActions);
    finalObserver.observe(finalCta);
    window.addEventListener("scroll", updateContentObstacleOverlap, { passive: true });
    window.addEventListener("resize", updateContentObstacleOverlap);
    document.addEventListener("toggle", updateAfterToggle, true);
    updateContentObstacleOverlap();

    return () => {
      heroActionsObserver.disconnect();
      finalObserver.disconnect();
      window.removeEventListener("scroll", updateContentObstacleOverlap);
      window.removeEventListener("resize", updateContentObstacleOverlap);
      document.removeEventListener("toggle", updateAfterToggle, true);
      if (toggleFrame !== null) window.cancelAnimationFrame(toggleFrame);
    };
  }, []);

  const visible = !heroActionsVisible && !contentObstacleOverlaps && !finalVisible;
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
        <Image
          className="sticky-inquiry__kakao-mark"
          src="/images/kakao-talk-mark.png"
          alt=""
          aria-hidden="true"
          width={68}
          height={69}
        />
        {kakao.label}
      </a>
    </aside>
  );
}
