"use client";

import { Wrench, CheckCircle } from "lucide-react";

const services = [
    { name: "배터리/소모품 교환", price: "별도 문의" },
    { name: "엔진오일/정비", price: "별도 문의" },
    { name: "사고 견인/출장", price: "별도 문의" },
    { name: "환경검사 대행", price: "별도 문의" },
    { name: "스캐너 진단", price: "35,000원", highlight: true },
    { name: "260cc초과 사용검사+등록", price: "330,000원", highlight: true, desc: "검사+등록+번호판+배송 원스톱 (취등록세 별도)" },
];

export default function ServicesSection() {
    return (
        <section className="bg-[#111] py-24 px-6 border-t border-white/5">
            <div className="mx-auto max-w-4xl text-center">
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-white mb-4">정비 및 대행 서비스</h2>
                    <p className="text-gray-400">매입뿐만 아니라 전문적인 정비 서비스도 제공합니다.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {services.map((service, idx) => (
                        <div
                            key={idx}
                            className={`flex items-center justify-between p-6 rounded-2xl border transition-colors ${service.highlight
                                ? "bg-brand-orange/10 border-brand-orange/50"
                                : "bg-black border-white/10 hover:border-white/30"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Wrench className={`w-5 h-5 ${service.highlight ? "text-brand-orange" : "text-gray-500"}`} />
                                <span className="font-bold text-white text-lg">{service.name}</span>
                            </div>
                            <span className={`font-medium ${service.highlight ? "text-brand-orange" : "text-gray-400"}`}>
                                {service.price}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-sm text-gray-500">
                    * 모든 시공은 사전 예약제로 운영됩니다.
                </div>
            </div>
        </section>
    );
}
