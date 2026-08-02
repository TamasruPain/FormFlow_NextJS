"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import logo from "../../../public/FormKyte.png";

interface SplashScreenProps {
  isFadingOut: boolean;
}

export function SplashScreen({ isFadingOut }: SplashScreenProps) {
  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-zinc-950 p-8 transition-opacity duration-500 ease-in-out ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Spacer to push content down */}
      <div className="flex-1" />

      {/* Central Pulsing Company Logo */}
      <div className="flex flex-col items-center gap-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: [1, 1.05, 1],
            opacity: 1,
          }}
          transition={{
            scale: {
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut",
            },
            opacity: {
              duration: 0.6,
            },
          }}
          className="relative flex h-20 w-20 items-center justify-center shadow-blue-500/20"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 opacity-60 blur-md" />
          <Image
            src={logo}
            alt="FormKyte Logo"
            className="relative h-20 w-20 object-contain z-10"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex items-center gap-2"
        >
          <span className="text-2xl font-extrabold tracking-tight text-white">
            Form<span className="bg-gradient-to-r from-blue-400 to-sky-400 bg-clip-text text-transparent">Kyte</span>
          </span>
        </motion.div>
      </div>

      {/* Footer Branding Signature fades in at bottom */}
      <div className="flex-1 flex flex-col justify-end items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-xs text-zinc-500 flex flex-col items-center gap-1.5"
        >
          <span className="text-[10px] uppercase tracking-widest text-[#71717A] font-semibold">
            Created & Built by
          </span>
          <a
            href="https://github.com/TamasruPain"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-[#E5A320] transition-colors duration-300 font-bold text-sm tracking-wide"
          >
            @TamasruPain
          </a>
        </motion.div>
      </div>
    </div>
  );
}
