"use client";

export default function PolicySection() {
    return (
        <section className="bg-[#0f0f0f] py-24 px-6 text-center md:px-12">
            <div className="mx-auto max-w-3xl rounded-3xl border border-white/5 bg-black p-10 md:p-16 shadow-2xl shadow-black/50">
                <h2 className="text-3xl font-bold text-white md:text-4xl">
                    <span className="text-brand-orange">솔직하게</span> 말씀드립니다.
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-gray-400">
                    시세에 근접한 금액을 원하신다면 업체보다 <span className="text-white font-bold">개인 거래(직거래)</span>를 추천드립니다.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-left backdrop-blur-sm">
                    <h3 className="mb-4 text-xl font-bold text-white">하지만 개인 거래는...</h3>
                    <ul className="space-y-3 text-gray-400">
                        <li className="flex items-start gap-2">
                            <span className="mt-1 text-red-500">✕</span>
                            260cc 초과 차량은 '사용검사'가 의무화되어 절차가 매우 복잡합니다.
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-1 text-red-500">✕</span>
                            <span>구매자의 무리한 네고 요구와 <br className="md:hidden" />예고 없는 약속 파기</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-1 text-red-500">✕</span>
                            판매 후 발생하는 A/S 분쟁과 감정 소모
                        </li>
                    </ul>
                </div>

                <div className="rounded-3xl border border-brand-orange/30 bg-brand-orange/10 p-8 text-left backdrop-blur-sm">
                    <h3 className="mb-4 text-xl font-bold text-white">바이크 매니저는!</h3>
                    <ul className="space-y-4 text-gray-300">
                        <li className="flex items-start gap-3">
                            <span className="mt-0.5 text-brand-orange shrink-0">✓</span>
                            <span>
                                260cc 초과 차량도 OK! <br className="md:hidden" />
                                복잡한 사용검사/폐지 업무 100% 대행
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="mt-0.5 text-brand-orange shrink-0">✓</span>
                            <span>
                                <span className="text-white font-bold">감정 소모 0%</span>. <br className="md:hidden" />
                                쿨하고 깔끔한 당일 현금 지급
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="mt-0.5 text-brand-orange shrink-0">✓</span>
                            <span>
                                매입 후 모든 법적 책임은 업체가 집니다. <br className="md:hidden" />
                                (A/S 분쟁 없음)
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        </section>
    );
}
