import TransactionPaths from "@/components/TransactionPaths";
import { site } from "@/content/site";

export default function TradeMethodComparison() {
  return (
    <section
      className="section section--paths"
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
      </div>
    </section>
  );
}
