import TransactionPaths from "@/components/TransactionPaths";
import { site } from "@/content/site";

export default function TradeMethodComparison() {
  return (
    <section
      className="section section--paths"
      id="process"
      aria-labelledby="method-title"
      data-testid="transaction-paths"
    >
      <div className="site-shell">
        <div className="section-heading section-heading--light transaction-paths-heading">
          <p>두 갈래 거래 경로</p>
          <h2 id="method-title">{site.tradePathSection.title}</h2>
          <span>{site.tradePathSection.description}</span>
        </div>
        <TransactionPaths paths={site.tradePaths} />
        <p className="transaction-paths__note">
          개인 거래는 가격 면에서 더 유리할 수 있습니다. 업체 매입은 시간과 절차를 줄이는 방식입니다.
        </p>
      </div>
    </section>
  );
}
