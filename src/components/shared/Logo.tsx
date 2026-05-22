import React from "react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = "", showText = true }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 group ${className}`}>
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 shadow-md shadow-blue-500/10 transition-transform duration-300 group-hover:scale-105">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-60" />
        <span className="relative text-sm font-bold text-white tracking-wider">FF</span>
      </div>
      {showText && (
        <span className="text-lg font-extrabold tracking-tight text-white bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent group-hover:text-white transition-colors duration-300">
          Form<span className="bg-gradient-to-r from-blue-400 to-sky-400 bg-clip-text text-transparent">Flow</span>
        </span>
      )}
    </Link>
  );
}
