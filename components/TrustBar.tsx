import Image from "next/image";
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
      <div className="site-shell channel-proof" aria-label={site.trustSection.channelLabel}>
        <strong className="channel-proof__label">{site.trustSection.channelLabel}</strong>
        <div className="channel-proof__grid">
          {site.trustSection.channels.map((channel) => {
            const content = (
              <>
                <Image src={channel.icon} alt="" aria-hidden="true" width={22} height={22} />
                <span>{channel.label}</span>
              </>
            );

            if ("href" in channel) {
              return (
                <a
                  className={`channel-proof__item channel-proof__item--${channel.id}`}
                  href={channel.href}
                  target="_blank"
                  rel="noreferrer"
                  key={channel.id}
                >
                  {content}
                </a>
              );
            }

            return (
              <span className={`channel-proof__item channel-proof__item--${channel.id}`} key={channel.id}>
                {content}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
