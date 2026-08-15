import type { ProcessStep } from "@/content/site";

type ProcessStoryProps = Readonly<{
  steps: readonly ProcessStep[];
}>;

export default function ProcessStory({ steps }: ProcessStoryProps) {
  return (
    <div className="process-story" data-testid="process-story">
      <div className="process-steps">
        {steps.map((step, index) => (
          <article
            className="process-step"
            key={step.number}
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
