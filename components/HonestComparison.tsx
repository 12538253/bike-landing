import { Clock, HandCoins } from "lucide-react";

export default function HonestComparison() {
  return (
    <section className="section section--ink honest-section" aria-labelledby="honest-title">
      <div className="site-shell honest-layout">
        <div className="section-heading section-heading--left section-heading--light">
          <p>가격과 시간의 솔직한 비교</p>
          <h2 id="honest-title">조금 더 받을지, 시간을 아낄지에 따라 선택이 달라집니다</h2>
          <span>
            개인 거래가 가격 면에서는 더 유리할 수 있습니다. 업체 매입은 거래에 드는 시간과 수고를
            줄이는 선택입니다.
          </span>
        </div>

        <div className="honest-grid">
          <article>
            <HandCoins aria-hidden="true" size={28} />
            <p>개인 거래</p>
            <h3>가격을 더 받을 가능성</h3>
            <span>
              사진 촬영, 게시글 작성, 반복 문의, 약속 변경, 가격 협상, 명의 이전 확인을 판매자가 직접
              챙깁니다.
            </span>
          </article>
          <article>
            <Clock aria-hidden="true" size={28} />
            <p>업체 매입</p>
            <h3>시간과 절차를 줄이는 방식</h3>
            <span>
              견적은 개인 거래보다 낮을 수 있지만, 현장에서 검수부터 계약, 입금, 상차까지 이어서
              처리합니다.
            </span>
          </article>
        </div>

        <div className="honest-callout">
          <span>빠른 일정과 현장 거래가 필요하신가요?</span>
          <strong>사진을 보내 예상 견적과 방문 가능 시간을 먼저 확인해 보세요.</strong>
        </div>
      </div>
    </section>
  );
}
