"use client";

// Plovoucí glass pill nav — centrovaný horizontálně, 24px od vrchu.
// Logo (SVG, bílá varianta přes invert filter) + "Klientský portál" CTA.

import Link from "next/link";
import Image from "next/image";

export function Nav() {
  return (
    <header
      className="fixed top-6 left-1/2 z-50 flex items-center gap-6 px-5 py-2"
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
        className="flex items-center pl-4 pr-6"
      >
        <Image
          src="/images/logo.svg"
          alt="Constructiva"
          width={240}
          height={56}
          priority
          className="h-[52px] w-auto object-contain"
        />
      </Link>
      <Link
        href="https://portal.constructiva.cz"
        target="_blank"
        rel="noopener noreferrer"
        className="px-5 py-2.5 rounded-full text-white text-sm font-medium transition-opacity hover:opacity-90"
        style={{
          background: "var(--color-secondary)",
        }}
      >
        Klientský portál
      </Link>
    </header>
  );
}
