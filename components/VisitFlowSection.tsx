import VisitFlow from "@/components/VisitFlow";
import { site } from "@/content/site";

export default function VisitFlowSection() {
  return (
    <section
      className="section section--paths"
      id="process"
      aria-labelledby="method-title"
      data-testid="visit-flow"
    >
      <div className="site-shell">
        <div className="section-heading section-heading--light visit-flow-heading">
          <p>{site.visitFlow.eyebrow}</p>
          <h2 id="method-title">{site.visitFlow.title}</h2>
          <span>{site.visitFlow.description}</span>
        </div>
        <VisitFlow flow={site.visitFlow} />
      </div>
    </section>
  );
}
