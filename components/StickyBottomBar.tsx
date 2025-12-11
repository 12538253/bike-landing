"use client";

import { Phone, MessageCircle } from "lucide-react";

export default function StickyBottomBar() {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 md:hidden">
            <a
                href="tel:01076164949"
                className="flex flex-1 items-center justify-center gap-2 bg-brand-orange text-white font-bold text-lg active:bg-orange-700"
            >
                <Phone className="h-5 w-5 fill-current" />
                전화 문의
            </a>
            <a
                href="http://pf.kakao.com/_MzgSn/chat"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 bg-[#FEE500] text-black font-bold text-lg active:bg-yellow-400"
            >
                <MessageCircle className="h-5 w-5 fill-current" />
                카톡 문의
            </a>
        </div>
    );
}
