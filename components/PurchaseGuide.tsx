import { Bike, FileCheck2, ShieldQuestion } from "lucide-react";

const guides = [
  {
    icon: Bike,
    title: "차량마다 먼저 확인합니다",
    description:
      "차종과 배기량만으로 판단하지 않습니다. 본인 소유 여부, 등록 상태, 차량 상태와 필요한 서류를 확인한 뒤 매입 가능 여부를 안내합니다.",
  },
  {
    icon: FileCheck2,
    title: "상태에 맞는 서류를 안내합니다",
    description:
      "보통 신분증과 이륜자동차 사용신고필증 또는 폐지증명서 등 차량 상태에 맞는 서류를 확인합니다.",
  },
  {
    icon: ShieldQuestion,
    title: "확인이 필요한 차량도 문의하세요",
    description:
      "타인·법인·외국인 명의 차량이나 미성년자 소유 차량, 서류를 잃어버린 경우, 차대번호가 훼손·재타각된 경우에는 소유 관계와 서류를 따로 확인합니다. 확인 결과에 따라 진행이 어렵거나 추가 서류가 필요할 수 있습니다.",
  },
];

export default function PurchaseGuide() {
  return (
    <section className="section section--paper" aria-labelledby="guide-title">
      <div className="site-shell">
        <div className="section-heading">
          <p>매입 가능 범위와 서류</p>
          <h2 id="guide-title">차량 이력과 등록 상태를 확인한 뒤 안내합니다</h2>
          <span>
            폐지·재등록·정기검사 필요 여부는 차량의 신고 이력과 상태에 따라 달라집니다. 필요한 절차와
            비용은 거래 전에 알려드립니다.
          </span>
        </div>
        <div className="guide-grid">
          {guides.map(({ icon: Icon, title, description }) => (
            <article key={title}>
              <Icon aria-hidden="true" size={27} />
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
