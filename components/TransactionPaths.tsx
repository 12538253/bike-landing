"use client";

import Image from "next/image";
import { ArrowUpRight, Check } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import type { TransactionPath, TransactionPathKey } from "@/content/site";

type TransactionPathsProps = Readonly<{
  paths: Readonly<Record<TransactionPathKey, TransactionPath>>;
}>;

const pathKeys: readonly TransactionPathKey[] = ["directVisit", "sendFirst"];
const pathNumbers: Readonly<Record<TransactionPathKey, string>> = {
  directVisit: "01",
  sendFirst: "02",
};
const enhancedQuery =
  "(min-width: 960px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

function subscribeToEnhancedMode(onChange: () => void) {
  const mediaQuery = window.matchMedia(enhancedQuery);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

function getEnhancedMode() {
  return window.matchMedia(enhancedQuery).matches;
}

function getServerEnhancedMode() {
  return false;
}

export default function TransactionPaths({ paths }: TransactionPathsProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGSVGElement>(null);
  const enhanced = useSyncExternalStore(
    subscribeToEnhancedMode,
    getEnhancedMode,
    getServerEnhancedMode,
  );
  const [pinnedPath, setPinnedPath] = useState<TransactionPathKey>("directVisit");
  const [previewPath, setPreviewPath] = useState<TransactionPathKey | null>(null);
  const [focusedPath, setFocusedPath] = useState<TransactionPathKey | null>(null);
  const activePath = focusedPath ?? previewPath ?? pinnedPath;

  useEffect(() => {
    const root = rootRef.current;
    const line = lineRef.current;
    if (!root || !line) return;

    line.dataset.revealed = "true";
    if (!enhanced) return;

    line.dataset.revealed = "false";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        line.dataset.revealed = "true";
        observer.disconnect();
      },
      { threshold: 0.18 },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, [enhanced]);

  return (
    <div className="transaction-paths" ref={rootRef}>
      <svg
        className="transaction-paths__lines"
        ref={lineRef}
        viewBox="0 0 1200 112"
        preserveAspectRatio="none"
        aria-hidden="true"
        data-testid="transaction-path-lines"
        data-revealed="true"
      >
        <path className="transaction-paths__line transaction-paths__line--stem" pathLength="1" d="M600 2V35" />
        <path className="transaction-paths__line transaction-paths__line--direct" pathLength="1" d="M600 35C540 35 454 45 330 108" />
        <path className="transaction-paths__line transaction-paths__line--send" pathLength="1" d="M600 35C660 35 746 45 870 108" />
        <circle cx="600" cy="35" r="5" />
      </svg>

      <div
        className="transaction-paths__grid"
        data-enhanced={enhanced ? "true" : undefined}
        data-active-path={enhanced ? activePath : undefined}
        onPointerLeave={() => {
          if (enhanced) setPreviewPath(null);
        }}
      >
        {pathKeys.map((key) => {
          const path = paths[key];
          const active = !enhanced || activePath === key;
          const panelId = `transaction-path-panel-${key}`;

          return (
            <article
              className={`transaction-path transaction-path--${key}`}
              data-active={active ? "true" : "false"}
              key={key}
              onPointerEnter={() => {
                if (enhanced) setPreviewPath(key);
              }}
              onFocusCapture={() => {
                if (enhanced) setFocusedPath(key);
              }}
              onBlurCapture={(event) => {
                if (enhanced && !event.currentTarget.contains(event.relatedTarget)) {
                  setFocusedPath((current) => (current === key ? null : current));
                }
              }}
            >
              <button
                className="transaction-path__summary"
                type="button"
                aria-expanded={active}
                aria-controls={panelId}
                onClick={() => {
                  if (enhanced) setPinnedPath(key);
                }}
              >
                <span className="transaction-path__media">
                  <Image
                    src={path.image}
                    alt={path.imageAlt}
                    fill
                    sizes="(max-width: 760px) 100vw, (max-width: 959px) 50vw, 55vw"
                    style={{ objectPosition: path.imagePosition }}
                  />
                  <span className="transaction-path__media-shade" aria-hidden="true" />
                  <span className="transaction-path__number" aria-hidden="true">{pathNumbers[key]}</span>
                </span>
                <span className="transaction-path__heading">
                  <span className="transaction-path__eyebrow">
                    {path.eyebrow}
                  </span>
                  <span className="transaction-path__title">{path.title}</span>
                </span>
                <span className="transaction-path__steps">
                  {path.steps.map((step, stepIndex) => (
                    <span className="transaction-path__step" key={step}>
                      <span>{step}</span>
                      {stepIndex < path.steps.length - 1 ? <ArrowUpRight aria-hidden="true" size={15} /> : null}
                    </span>
                  ))}
                </span>
              </button>

              <div
                className="transaction-path__panel"
                id={panelId}
                inert={enhanced && !active ? true : undefined}
                aria-hidden={enhanced && !active ? "true" : undefined}
              >
                <p>{path.description}</p>
                {path.confirmation ? (
                  <div className="transaction-path__confirmation">
                    <Check aria-hidden="true" size={20} />
                    <span>
                      <small>{path.confirmation.label}</small>
                      <strong>
                        <span>{path.confirmation.detail.slice(0, 1)}</span>
                        <span>{path.confirmation.detail.slice(1)}</span>
                      </strong>
                    </span>
                  </div>
                ) : null}
                {path.cta ? (
                  <a
                    className="transaction-path__cta"
                    href={path.cta.href}
                    data-cta={path.cta.ctaId}
                    target={path.cta.external ? "_blank" : undefined}
                    rel={path.cta.external ? "noreferrer" : undefined}
                    tabIndex={enhanced && !active ? -1 : undefined}
                  >
                    {path.cta.label}
                    <ArrowUpRight aria-hidden="true" size={18} />
                  </a>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
