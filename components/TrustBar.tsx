import { BadgeCheck, Clock3, MapPinCheck, WalletCards } from "lucide-react";

import { site } from "@/content/site";

const icons = [BadgeCheck, Clock3, MapPinCheck, WalletCards];

export default function TrustBar() {
  return (
    <section className="trust-bar" id="trust" aria-labelledby="trust-title">
      <h2 className="sr-only" id="trust-title">
        {site.trustSection.title}
      </h2>
      <div className="site-shell trust-bar__grid">
        {site.trustSection.points.map((point, index) => {
          const Icon = icons[index];
          return (
            <div className="trust-point" key={point}>
              <Icon aria-hidden="true" size={24} strokeWidth={1.8} />
              <strong>{point}</strong>
            </div>
          );
        })}
      </div>
    </section>
  );
}
