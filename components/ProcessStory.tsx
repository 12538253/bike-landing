"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import type { ProcessStep } from "@/content/site";

type ProcessStoryProps = Readonly<{
  steps: readonly ProcessStep[];
}>;

export default function ProcessStory({ steps }: ProcessStoryProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [enhanced, setEnhanced] = useState(false);
  const stepRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 960px)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | undefined;

    const stopObserving = () => {
      observer?.disconnect();
      observer = undefined;
    };

    const updateMode = () => {
      stopObserving();
      const shouldEnhance = desktopQuery.matches && !reducedMotionQuery.matches;
      setEnhanced(shouldEnhance);

      if (!shouldEnhance) {
        setActiveStep(0);
        return;
      }

      const updateActiveStep = () => {
        const focusLine = window.innerHeight * 0.48;
        let closestIndex = 0;
        let closestDistance = Number.POSITIVE_INFINITY;

        stepRefs.current.forEach((step, index) => {
          if (!step) return;
          const bounds = step.getBoundingClientRect();
          const center = bounds.top + bounds.height / 2;
          const distance = Math.abs(center - focusLine);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });

        setActiveStep(closestIndex);
      };

      observer = new IntersectionObserver(updateActiveStep, {
        rootMargin: "-20% 0px -20% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      });
      stepRefs.current.forEach((step) => {
        if (step) observer?.observe(step);
      });
      updateActiveStep();
    };

    updateMode();
    desktopQuery.addEventListener("change", updateMode);
    reducedMotionQuery.addEventListener("change", updateMode);

    return () => {
      stopObserving();
      desktopQuery.removeEventListener("change", updateMode);
      reducedMotionQuery.removeEventListener("change", updateMode);
    };
  }, []);

  const active = steps[activeStep];

  return (
    <div
      className="process-story"
      data-testid="process-story"
      data-enhanced={String(enhanced)}
      data-active-step={activeStep}
    >
      <div className="process-stage" aria-hidden={!enhanced}>
        <div className="process-stage__frame">
          <Image
            src={active.image}
            alt=""
            fill
            sizes="(min-width: 960px) 46vw, 100vw"
            style={{ objectPosition: active.imagePosition }}
          />
          <div className="process-stage__shade" />
          <div className="process-stage__content">
            <span>{active.number} / 04</span>
            <strong data-testid="process-stage-label">{active.title}</strong>
            <p>{active.description}</p>
          </div>
        </div>
      </div>

      <div className="process-steps">
        {steps.map((step, index) => (
          <article
            className={`process-step${index === activeStep ? " is-active" : ""}`}
            key={step.number}
            ref={(element) => {
              stepRefs.current[index] = element;
            }}
            data-testid={`process-step-${index}`}
          >
            <div
              className="process-step__media"
              style={{ backgroundImage: `url(${step.image})`, backgroundPosition: step.imagePosition }}
              aria-hidden="true"
            />
            <div className="process-step__body">
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
