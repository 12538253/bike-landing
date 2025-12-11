"use client";

import { MapPin, ExternalLink } from "lucide-react";

export default function LocationSection() {
    return (
        <section className="bg-black py-24 px-6 md:px-12 border-t border-white/5">
            <div className="mx-auto max-w-4xl text-center">
                <div className="mb-12 space-y-4">
                    <h2 className="text-3xl font-bold text-white md:text-4xl">
                        매장으로 직접 오셔도 <br className="md:hidden" />
                        <span className="text-brand-orange">환영합니다</span>
                    </h2>
                    <p className="text-gray-400 text-lg">
                        100% 실매물, 투명한 거래를 약속드립니다. <br className="md:hidden" />
                        편하게 방문하셔서 커피 한 잔 하세요.
                    </p>
                </div>

                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#111] p-8 md:p-12">
                    <div className="flex flex-col items-center justify-center gap-6">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange">
                            <MapPin className="h-8 w-8" />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-white">바이크 매니저</h3>
                            <p className="text-xl text-gray-300">인천 남동구 백범로 411</p>
                            <p className="text-sm text-gray-500">(간석동 238-5)</p>
                        </div>

                        <div className="mt-4 w-full md:w-auto">
                            <a
                                href="https://naver.me/F1rPbAcV"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#03C75A] px-8 py-4 text-lg font-bold text-white transition-transform active:scale-95 md:w-auto hover:bg-[#02b351]"
                            >
                                <span className="relative z-10">네이버 지도 보기</span>
                                <ExternalLink className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
