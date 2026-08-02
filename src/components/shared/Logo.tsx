import React from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "../../../public/FormKyte.png";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = "", showText = true }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 group ${className}`}>
      <div className="relative flex h-9 w-9 items-center justify-center shadow-blue-500/10 transition-transform duration-300 group-hover:scale-105">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-60" />
        <Image
          src={logo}
          alt="FormKyte Logo"
          className="relative h-8 w-8 object-contain z-10"
        />
      </div>
      {showText && (
        <span className="text-lg font-extrabold tracking-tight text-white bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent group-hover:text-white transition-colors duration-300">
          Form<span className="bg-gradient-to-r from-blue-400 to-sky-400 bg-clip-text text-transparent">Kyte</span>
        </span>
      )}
    </Link>
  );
}
