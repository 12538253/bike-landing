"use client";

import { MessageCircle, Calculator, Truck, BadgeDollarSign } from "lucide-react";

const steps = [
    {
        icon: MessageCircle,
        step: "01",
        title: "문의",
        desc: "문자/전화/카톡으로 모델명과 사진을 전송해주세요.",
    },
    {
        icon: Calculator,
        step: "02",
        title: "견적",
        desc: "1분 내에 합리적인 매입가를 제시해 드립니다.",
    },
    {
        icon: Truck,
        step: "03",
        title: "출장",
        desc: "계신 곳으로 1톤 대형 리프트 트럭이 즉시 출동합니다.",
    },
    {
        icon: BadgeDollarSign,
        step: "04",
        title: "지급",
        desc: "현장에서 100% 송금 확인 후 바이크를 픽업합니다.",
    },
];

export default function ProcessSection() {
    return (
        <section className="bg-black py-24 px-6 md:px-12">
            <div className="mx-auto max-w-6xl">
                <div className="mb-16 text-center">
                    <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
                        Buying Process
                    </h2>
                    <p className="text-gray-400">복잡한 절차 없이, 단 4단계로 끝납니다.</p>
                </div>

                <div className="relative grid gap-8 md:grid-cols-4">
                    {/* Connecting Line (Desktop Only) */}
                    <div className="absolute top-12 left-0 hidden h-0.5 w-full bg-gradient-to-r from-transparent via-brand-orange/50 to-transparent md:block" />

                    {steps.map((step, idx) => (
                        <div key={idx} className="group relative text-center">
                            <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 border-black bg-[#111] transition-transform group-hover:scale-110 group-hover:border-brand-orange/50">
                                <step.icon className="h-10 w-10 text-brand-orange" />
                                <span className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-brand-orange text-sm font-bold text-white">
                                    {step.step}
                                </span>
                            </div>
                            <h3 className="mb-2 text-xl font-bold text-white">{step.title}</h3>
                            <p className="text-sm leading-relaxed text-gray-400">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
