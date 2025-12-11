"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export default function Hero() {
    return (
        <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden bg-black px-6 text-center">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/hero-bg.png"
                    alt="Motorcycle Night Street"
                    fill
                    priority
                    className="object-cover opacity-60"
                    quality={90}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />
            </div>

            <div className="relative z-10 max-w-4xl space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-4"
                >
                    <h2 className="text-sm font-medium tracking-widest text-brand-orange uppercase">
                        Premium Motorcycle Buying Service
                    </h2>
                    <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white md:text-5xl lg:text-7xl">
                        복잡한 중고 거래, <br className="md:hidden" />
                        <span className="text-white">전문가에게 맡기세요.</span>
                    </h1>
                    <p className="text-lg text-gray-400 md:text-2xl">
                        당근, 중고나라 네고에 지치셨나요? <br className="hidden md:block" />
                        수도권 <span className="text-white font-bold">2시간 내 방문</span>, 도착 후 <span className="text-brand-orange font-bold">1시간 내</span> 모든 처리를 끝내드립니다.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="flex flex-col flex-wrap justify-center gap-2 text-sm font-medium text-gray-400 md:flex-row md:gap-4 md:text-base"
                >
                    <span className="flex items-center justify-center gap-2">
                        ✓ 번호판 미폐지 OK
                    </span>
                    <span className="hidden h-4 w-px bg-white/20 md:block" />
                    <span className="flex items-center justify-center gap-2">
                        ✓ 환경검사/튜닝차 매입
                    </span>
                    <span className="hidden h-4 w-px bg-white/20 md:block" />
                    <span className="flex items-center justify-center gap-2">
                        ✓ 전국 1톤 리프트 출장
                    </span>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="flex flex-col items-center gap-4 pt-4 md:flex-row md:justify-center"
                >
                    <a
                        href="http://pf.kakao.com/_MzgSn/chat"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shadow-glow animate-pulse-custom group relative inline-flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-brand-orange px-8 text-lg font-bold text-white transition-transform active:scale-95 md:w-auto"
                    >
                        <span className="relative z-10">내 바이크 견적, 1분 만에 확인하기</span>
                        <ArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
