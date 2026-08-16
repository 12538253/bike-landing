"use client";

import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";

import type { VisitFlowCopy, VisitStageKey } from "@/content/site";

type VisitFlowProps = Readonly<{ flow: VisitFlowCopy }>;

const stageKeys: readonly VisitStageKey[] = ["photoGuide", "onsiteDeal"];
const stageNumbers: Readonly<Record<VisitStageKey, string>> = {
  photoGuide: "01",
  onsiteDeal: "02",
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

export default function VisitFlow({ flow }: VisitFlowProps) {
  const enhanced = useSyncExternalStore(subscribeToEnhancedMode, getEnhancedMode, getServerEnhancedMode);
  const [pinnedStage, setPinnedStage] = useState<VisitStageKey>("photoGuide");
  const [previewStage, setPreviewStage] = useState<VisitStageKey | null>(null);
  const [focusedStage, setFocusedStage] = useState<VisitStageKey | null>(null);
  const activeStage = focusedStage ?? previewStage ?? pinnedStage;

  useEffect(() => {
    const mediaQuery = window.matchMedia(enhancedQuery);
    const resetTransientStages = () => {
      setPreviewStage(null);
      setFocusedStage(null);
    };
    mediaQuery.addEventListener("change", resetTransientStages);
    return () => mediaQuery.removeEventListener("change", resetTransientStages);
  }, []);

  return (
    <div className="visit-flow" data-enhanced={enhanced ? "true" : undefined} data-active-stage={enhanced ? activeStage : undefined}>
      <div className="visit-flow__progress" aria-hidden="true">
        <span>01</span>
        <ArrowRight size={18} />
        <span>02</span>
      </div>
      <div className="visit-flow__stages" onPointerLeave={() => enhanced && setPreviewStage(null)}>
        {stageKeys.map((key) => {
          const stage = flow.stages[key];
          const active = !enhanced || activeStage === key;
          const panelId = `visit-flow-panel-${key}`;
          const summaryContent = (
            <>
              <span className="visit-flow__number" aria-hidden="true">{stageNumbers[key]}</span>
              <span className="visit-flow__stage-title">{stage.title}</span>
              <span className="visit-flow__facts">
                {stage.facts.map((fact) => <span key={fact}>{fact}</span>)}
              </span>
            </>
          );

          return (
            <article
              className={`visit-flow__stage visit-flow__stage--${key}`}
              data-active={active ? "true" : "false"}
              key={key}
              onPointerEnter={() => enhanced && setPreviewStage(key)}
              onFocusCapture={() => enhanced && setFocusedStage(key)}
              onBlurCapture={(event) => {
                if (enhanced && !event.currentTarget.contains(event.relatedTarget)) {
                  setFocusedStage((current) => current === key ? null : current);
                }
              }}
            >
              {enhanced ? (
                <button
                  className="visit-flow__stage-summary"
                  type="button"
                  aria-expanded={active}
                  aria-controls={panelId}
                  onClick={() => setPinnedStage(key)}
                >
                  {summaryContent}
                </button>
              ) : <div className="visit-flow__stage-summary">{summaryContent}</div>}
              <div
                className="visit-flow__stage-panel"
                id={panelId}
                inert={enhanced && !active ? true : undefined}
                aria-hidden={enhanced && !active ? "true" : undefined}
              >
                <p>{stage.description}</p>
                {stage.confirmation ? (
                  <div className="visit-flow__confirmation">
                    <Check aria-hidden="true" size={20} />
                    <span><small>{stage.confirmation.label}</small><strong>{stage.confirmation.detail}</strong></span>
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
      <a className="visit-flow__cta" href={flow.cta.href} data-cta={flow.cta.ctaId} target={flow.cta.external ? "_blank" : undefined} rel={flow.cta.external ? "noreferrer" : undefined}>
        {flow.cta.label}<ArrowUpRight aria-hidden="true" size={18} />
      </a>
      <details className="visit-flow__safety">
        <summary>{flow.safety.summary}</summary>
        <p>{flow.safety.answer}</p>
      </details>
    </div>
  );
}
