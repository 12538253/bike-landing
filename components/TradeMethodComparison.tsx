import { CircleAlert, CircleCheck, Truck } from "lucide-react";

export default function TradeMethodComparison() {
  return (
    <section className="section section--paper" aria-labelledby="method-title">
      <div className="site-shell">
        <div className="section-heading">
          <p>거래 방식부터 비교하세요</p>
          <h2 id="method-title">바이크를 보내기 전에 최종 금액과 반환 조건을 확인하세요</h2>
          <span>차량이 내 손을 떠나는 시점이 다르면 확인해야 할 조건도 달라집니다.</span>
        </div>

        <div className="method-grid">
          <article className="method-card method-card--direct">
            <div className="method-card__icon">
              <CircleCheck aria-hidden="true" size={25} />
            </div>
            <p>바이크매니저 직접 방문 거래</p>
            <h3>차량이 곁에 있는 동안 조건을 함께 확인합니다</h3>
            <ul>
              <li>약속한 장소에서 판매자와 차량 상태 확인</li>
              <li>최종 금액과 계약 내용을 상차 전에 설명</li>
              <li>판매대금 입금 확인 후 차량 상차</li>
            </ul>
          </article>

          <article className="method-card">
            <div className="method-card__icon">
              <Truck aria-hidden="true" size={25} />
            </div>
            <p>차량을 먼저 보내는 거래</p>
            <h3>출발 전에 반환 조건과 비용 부담 주체를 확인하세요</h3>
            <ul>
              <li>현장 확인 뒤 금액이 달라질 때의 반환 조건</li>
              <li>회수 또는 추가 운송비를 누가 부담하는지</li>
              <li>업체가 안내하는 감가 기준과 최종 결정 시점</li>
            </ul>
            <div className="method-card__note">
              <CircleAlert aria-hidden="true" size={18} />
              업체마다 절차가 다르므로 차량을 보내기 전에 직접 확인하세요.
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
