"use client";



const models = [
    "HONDA PCX125",
    "YAMAHA NMAX",
    "YAMAHA XMAX",
    "YAMAHA R3",
    "HARLEY IRON883",
    "HONDA GOLDWING",
    "BMW S1000RR",
    "KAWASAKI NINJA",
    "DUCATI PANIGALE",
    "SUZUKI HAYABUSA",
    "VESPA PRIMAVERA",
    "SUPER CUB",
];

export default function Footer() {
    return (
        <footer className="border-t border-white/10 bg-black pt-12 pb-8">
            {/* Marquee Ticker */}
            <div className="mb-12 overflow-hidden border-b border-t border-white/5 py-4 bg-white/2">
                <div className="flex gap-12 whitespace-nowrap animate-scroll w-max hover:[animation-play-state:paused]">
                    {[...models, ...models, ...models, ...models].map((model, idx) => (
                        <span key={idx} className="text-lg font-bold text-white/20">
                            {model}
                        </span>
                    ))}
                </div>
            </div>

            <div className="px-6 text-center md:px-12">
                <h2 className="mb-6 text-2xl font-bold text-white">BIKE MANAGER</h2>
                <div className="border-t border-white/10 pt-8 text-center text-sm text-gray-500">
                    <p className="mb-2">
                        상호명: 바이크매니저 | 대표자: 유동영 | 사업자등록번호: 341-05-00319
                    </p>
                    <p className="mb-2">
                        주소: 인천광역시 남동구 백범로 411, 1층(간석동)
                    </p>
                    <p className="mb-2">
                        영업시간: 09:00 - 22:00 (연중무휴)
                    </p>
                    <p>
                        Copyright © {new Date().getFullYear()} Bike Manager. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
