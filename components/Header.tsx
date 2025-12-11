"use client";

import { Phone } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Header() {
    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-black/80 px-6 backdrop-blur-md md:px-12"
        >
            <Link href="/" className="text-xl font-bold tracking-tighter text-white">
                BIKE MANAGER
            </Link>

            <a
                href="tel:01076164949"
                className="group flex h-10 items-center gap-2 rounded-full border border-brand-orange/30 bg-brand-orange/10 px-4 text-sm font-semibold text-brand-orange transition-all hover:bg-brand-orange hover:text-white md:h-auto md:py-2"
            >
                <Phone className="h-4 w-4 fill-current" />
                <span className="hidden md:inline">24시 문의</span> 010-7616-4949
            </a>
        </motion.header>
    );
}
