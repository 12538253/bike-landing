"use client";

import { Star, User } from "lucide-react";

const reviews = [
    {
        user: "냥펀치",
        rating: 5,
        desc: "중고 바이크 구매후 점검과 엔진오일 교환으로 매장에 방문했습니다. 사장님 친절하시고 설명도 잘해주셔서 믿음이 가네요. 다음에 또 방문하겠습니다!",
        date: "최근 방문"
    },
    {
        user: "돼랑이",
        rating: 5,
        desc: "포르자750 판매하고 왔습니다. 다른곳보다 견적도 잘쳐주시고 입금도 바로바로 해주셔서 기분좋게 거래했습니다. 번창하세요~",
        date: "최근 방문"
    },
    {
        user: "김민재",
        rating: 5,
        desc: "첫 바이크라 모르는게 많았는데 하나하나 친절하게 알려주셔서 감사합니다. 탁송도 빠르고 바이크 상태도 너무 좋아요!",
        date: "최근 방문"
    }
];

const NaverLogo = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M16 16.5V6.6L8 18.2V6.6H3.6v11.8h4.4l8-11.6v11.6h4.4V6.6H16v9.9z" />
    </svg>
);

const DaangnLogo = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M19.8 11.2c-.3 1.1-1.3 2-2.4 2.1-.2 1.3-1.6 2.3-1.7 2.4-1.2 1.1-2.9 1.7-4.6 1.7-3.2 0-5.8-2.6-5.8-5.8 0-.3.2-.5.5-.5s.5.2.5.5c0 2.6 2.1 4.7 4.7 4.7 1.4 0 2.8-.5 3.8-1.5.1-.1 1.2-.9 1.3-1.8H5c-.3 0-.5-.2-.5-.5s.2-.5.5-.5h12.1c.1-.8.2-1.6.2-2.4 0-1.7-.8-3.3-2.2-4.2-1.2-.8-2.7-1-4.1-.6-.2.1-.5 0-.6-.2-.1-.2 0-.5.2-.6 1.7-.6 3.6-.3 5.1.7 1.7 1.1 2.7 3.1 2.7 5.2 0 .5-.1.9-.1 1.3h.9c.3 0 .5.2.5.5s-.1.4-.4.4z" />
        <path d="M8.5 12c-1.9 0-3.5-1.6-3.5-3.5 0-1.9 1.6-3.5 3.5-3.5s3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm0-6c-1.4 0-2.5 1.1-2.5 2.5s1.1 2.5 2.5 2.5 2.5-1.1 2.5-2.5-1.1-2.5-2.5-2.5z" />
        <path d="M13.5 6c-1.4 0-2.5-1.1-2.5-2.5S12.1 1 13.5 1s2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5zm0-4C12.7 2 12 2.7 12 3.5s.7 1.5 1.5 1.5 1.5-.7 1.5-1.5S14.3 2 13.5 2z" />
    </svg>
);

export default function ReviewsSection() {
    return (
        <section className="bg-black py-20 px-6 border-t border-white/5">
            <div className="mx-auto max-w-6xl">
                <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-bold text-white mb-2">실제 고객님들의 <span className="text-brand-orange">찐 후기</span></h2>
                        <div className="flex items-center justify-center md:justify-start gap-2">
                            <div className="flex text-yellow-500">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-current" />
                                ))}
                            </div>
                            <span className="text-white font-bold text-xl">5.0</span>
                            <span className="text-gray-400">(후기 89개)</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-center md:items-end gap-3">
                        <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#03C75A]/30 bg-[#03C75A]/10 text-[#03C75A] transition-colors hover:bg-[#03C75A]/20">
                            <NaverLogo className="w-4 h-4 fill-current" />
                            <span className="text-sm font-bold">네이버 인증 업체</span>
                        </div>
                        <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#ff6f0f]/30 bg-[#ff6f0f]/10 text-[#ff6f0f] transition-colors hover:bg-[#ff6f0f]/20">
                            <DaangnLogo className="w-5 h-5 fill-current" />
                            <span className="text-sm font-bold">당근마켓 인증 업체</span>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {reviews.map((review, idx) => (
                        <div key={idx} className="bg-[#111] p-6 rounded-2xl border border-white/10 hover:border-brand-orange/50 transition-colors">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-bold text-white">{review.user}</div>
                                    <div className="flex text-yellow-500 text-xs">
                                        {[...Array(review.rating)].map((_, i) => (
                                            <Star key={i} className="w-3 h-3 fill-current" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
                                "{review.desc}"
                            </p>
                            <div className="text-xs text-gray-500">{review.date}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
