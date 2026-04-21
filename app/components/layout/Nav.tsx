"use client";

// Sticky nav (SPEC 2.3) — glass-efekt, viditelný nad všemi sekcemi.
// Logo zatím jako text fallback; jakmile Michal dodá /images/logo.svg,
// lze přepnout na <Image>.

import Link from "next/link";

export function Nav() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-[72px]
                 flex items-center justify-between
                 px-6 md:px-12 lg:px-20
                 bg-white/60 backdrop-blur-md border-b border-white/20"
    >
      <Link
        href="/"
        aria-label="Constructiva — domů"
        className="flex items-center gap-3"
      >
        {/* TODO: jakmile bude logo.svg v /public/images/, nahradit <Image> */}
        <span className="font-manrope font-semibold tracking-[0.2em] text-secondary text-sm">
          CONSTRUCTIVA
        </span>
      </Link>

      <Link
        href="https://portal.constructiva.cz"
        target="_blank"
        rel="noopener noreferrer"
        className="px-5 py-2.5 rounded-full bg-secondary text-white
                   text-sm font-medium tracking-wide
                   hover:bg-secondary/90 transition-colors"
      >
        Klientský portál
      </Link>
    </header>
  );
}
