import ProcessStory from "@/components/ProcessStory";
import { site } from "@/content/site";

export default function ProcessSection() {
  return (
    <section className="section section--warm" id="process" aria-labelledby="process-title">
      <div className="site-shell">
        <div className="section-heading section-heading--left process-heading">
          <p>문의부터 상차까지</p>
          <h2 id="process-title">차량을 먼저 맡기지 않는 현장 거래 4단계</h2>
          <span>사진 기준 예상 견적을 먼저 안내하고, 최종 결정은 판매자가 현장에서 내립니다.</span>
        </div>
        <ProcessStory steps={site.processSteps} />
      </div>
    </section>
  );
}
