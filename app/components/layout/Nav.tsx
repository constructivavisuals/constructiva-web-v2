"use client";

// Plovoucí glass pill nav — centrovaný horizontálně, 24px od vrchu.
// Logo (bílé přes CSS filter) + "Klientský portál" tmavý button.

import Link from "next/link";
import Image from "next/image";

export function Nav() {
  return (
    <header
      className="fixed top-6 left-1/2 z-50 flex items-center gap-3 px-3 py-2"
      style={{
        transform: "translateX(-50%)",
        background: "rgba(255, 255, 255, 0.12)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: "9999px",
      }}
    >
      <Link
        href="/"
        aria-label="Constructiva — domů"
        className="flex items-center pl-3 pr-2"
      >
        <Image
          src="/images/logo.png"
          alt="Constructiva"
          width={110}
          height={24}
          priority
          className="h-6 w-auto object-contain"
          style={{ filter: "brightness(0) invert(1)" }}
        />
      </Link>
      <Link
        href="https://portal.constructiva.cz"
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 rounded-full text-white text-sm font-medium transition-colors hover:bg-white/20"
        style={{
          background: "rgba(0, 0, 0, 0.5)",
        }}
      >
        Klientský portál
      </Link>
    </header>
  );
}
