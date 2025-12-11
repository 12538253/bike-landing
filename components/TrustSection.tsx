"use client";

import { Bike, Clock, FileCheck, Truck, ShieldCheck } from "lucide-react";

const features = [
    {
        icon: Clock,
        title: "24시 전천후 출동",
        desc: "수도권 2시간 내 현장 도착, 도착 즉시 1시간 이내에 모든 업무(서류/입금)를 마무리합니다.",
    },
    {
        icon: FileCheck,
        title: "번호판 미폐지 OK",
        desc: "번호판이 달려있어도 괜찮습니다. 구청 업무부터 세금 납부, 폐지까지 100% 대행해 드립니다.",
    },
    {
        icon: ShieldCheck,
        title: "환경검사/구조변경",
        desc: "2017년식 이후 환경검사 대상, 튜닝으로 인한 불합격 차량도 문제없이 매입하고 대행합니다.",
    },
    {
        icon: Bike,
        title: "전 기종 매입",
        desc: "50cc 스쿠터부터 1800cc 골드윙/할리까지. 260cc 초과 차량 사용검사비 걱정 마세요.",
    },
];

export default function TrustSection() {
    return (
        <section className="bg-black py-24 px-6 md:px-12">
            <div className="mx-auto max-w-6xl">
                <div className="mb-16 text-center">
                    <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">Why Choose Us?</h2>
                    <p className="text-gray-400">고객님이 만족하는 이유가 있습니다.</p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 transition-colors hover:border-brand-orange/50 hover:bg-white/10"
                        >
                            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange group-hover:bg-brand-orange group-hover:text-white transition-colors">
                                <feature.icon className="h-7 w-7" />
                            </div>
                            <h3 className="mb-3 text-xl font-bold text-white">{feature.title}</h3>
                            <p className="text-sm leading-relaxed text-gray-300">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
