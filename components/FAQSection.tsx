"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
    {
        q: "서류가 없는 바이크도 매입 가능한가요?",
        a: "본인 명의의 바이크라면 번호판 폐지 전이라도 매입 가능합니다. 저희가 구청 업무부터 번호판 폐지까지 모든 행정 절차를 무료로 대행해 드립니다."
    },
    {
        q: "판매 대금은 언제 받을 수 있나요?",
        a: "현장에서 바이크 상태 확인 즉시, 고객님의 계좌로 전액 이체해 드립니다. 입금 확인 후 바이크를 상차하므로 안심하셔도 됩니다."
    },
    {
        q: "주말이나 비 오는 날에도 방문 가능한가요?",
        a: "네, 가능합니다. 저희는 1톤 리프트 윙바디 차량을 보유하고 있어 날씨와 상관없이 안전하게 매입 및 운송이 가능합니다. 365일 24시간 언제든 문의주세요."
    },
    {
        q: "사고난 바이크나 방치된 바이크도 되나요?",
        a: "네, 사고차, 방치차, 시동 안 걸리는 바이크, 환경검사 불합격 차량 모두 매입합니다. 수리비 감가를 최소화하여 합리적인 금액을 제시해 드립니다."
    }
];

export default function FAQSection() {
    const [openIdx, setOpenIdx] = useState<number | null>(0);

    return (
        <section className="bg-black py-24 px-6 border-t border-white/5">
            <div className="mx-auto max-w-3xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-white mb-4">자주 묻는 질문</h2>
                    <p className="text-gray-400">궁금하신 점을 빠르게 해결해 드립니다.</p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <div key={idx} className="border border-white/10 rounded-2xl bg-[#111] overflow-hidden">
                            <button
                                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                            >
                                <span className="text-lg font-bold text-white flex gap-3">
                                    <span className="text-brand-orange">Q.</span>
                                    {faq.q}
                                </span>
                                {openIdx === idx ? (
                                    <ChevronUp className="w-5 h-5 text-gray-400" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                )}
                            </button>
                            <AnimatePresence>
                                {openIdx === idx && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="px-6 pb-6 pt-0 border-t border-white/5">
                                            <p className="text-gray-300 leading-relaxed pt-4">
                                                <span className="font-bold text-brand-orange mr-2">A.</span>
                                                {faq.a}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
