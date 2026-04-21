"use client";

// Sticky nav — glass-efekt, viditelný nad všemi sekcemi.
// Barvy: bílé pro pohled nad tmavým hero background.
// TODO: dark/light theme switch podle scroll pozice (nad tmavými sekcemi
// bílý text, nad offwhite sekcemi tmavý).

import Link from "next/link";

export function Nav() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-[72px]
                 flex items-center justify-between
                 px-6 md:px-12 lg:px-20"
      style={{
        background: "rgba(255, 255, 255, 0.10)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
      }}
    >
      <Link
        href="/"
        aria-label="Constructiva — domů"
        className="flex items-center gap-3"
      >
        {/* TODO: jakmile bude logo.svg v /public/images/, nahradit <Image> */}
        <span className="font-manrope font-semibold tracking-[0.2em] text-white text-sm">
          CONSTRUCTIVA
        </span>
      </Link>

      <Link
        href="https://portal.constructiva.cz"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center rounded-full
                   bg-white/15 border border-white/25 text-white
                   px-5 py-2.5 text-sm font-medium tracking-wide
                   backdrop-blur-md
                   hover:bg-white/25 transition-colors"
      >
        Klientský portál
      </Link>
    </header>
  );
}
