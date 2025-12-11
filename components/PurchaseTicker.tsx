"use client";

import { useEffect, useState } from "react";

const recentPurchases = [
    "서울 강남구 김OO님, 야마하 R3 매입 완료",
    "인천 부평구 이OO님, 혼다 PCX 125 매입 완료",
    "경기 수원시 박OO님, 할리데이비슨 아이언 883 매입 완료",
    "서울 마포구 최OO님, 베스파 GTS 300 매입 완료",
    "인천 남동구 정OO님, 스즈키 GSX-R1000 매입 완료",
    "경기 성남시 강OO님, 가와사키 닌자 400 매입 완료",
];

export default function PurchaseTicker() {
    return (
        <div className="bg-brand-orange/10 border-y border-brand-orange/20 overflow-hidden py-3">
            <div className="flex gap-12 whitespace-nowrap animate-scroll w-max">
                {[...recentPurchases, ...recentPurchases, ...recentPurchases, ...recentPurchases].map((text, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-brand-orange animate-pulse"></span>
                        <span className="text-brand-orange font-medium text-sm md:text-base">
                            {text}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
