import { ChevronDown } from "lucide-react";

export default function PurchaseGuide() {
  return (
    <section className="section section--paper purchase-guide" aria-labelledby="guide-title">
      <div className="site-shell purchase-guide__inner">
        <div className="section-heading section-heading--left">
          <p>매입 가능 범위</p>
          <h2 id="guide-title">스쿠터부터 대형 바이크까지 상담합니다</h2>
          <span>차량 상태와 등록 정보를 확인한 뒤 매입 가능 여부와 필요한 서류를 안내합니다.</span>
        </div>

        <details className="purchase-guide__details">
          <summary>
            <span>명의·서류가 다른 경우</span>
            <ChevronDown aria-hidden="true" size={21} />
          </summary>
          <p>
            보통 신분증과 이륜자동차 사용신고필증 또는 폐지증명서를 확인합니다. 타인·법인·외국인
            명의, 미성년자 소유, 서류 분실, 차대번호 훼손·재타각 차량은 추가 확인이 필요합니다. 확인
            결과에 따라 진행이 어렵거나 추가 서류가 필요할 수 있습니다.
          </p>
        </details>
      </div>
    </section>
  );
}
