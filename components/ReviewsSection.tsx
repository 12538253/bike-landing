"use client";

import Image from "next/image";

// ... reviews array ...

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
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 transition-colors hover:bg-white/10">
                            <div className="relative w-5 h-5 rounded overflow-hidden">
                                <Image
                                    src="/images/naver-icon.png"
                                    alt="Naver"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <span className="text-sm font-bold text-gray-300">네이버 인증 업체</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 transition-colors hover:bg-white/10">
                            <div className="relative w-5 h-5 rounded overflow-hidden">
                                <Image
                                    src="/images/daangn-icon.png"
                                    alt="Daangn"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <span className="text-sm font-bold text-gray-300">당근마켓 인증 업체</span>
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
