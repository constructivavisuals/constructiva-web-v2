"use client";

// Sekce 1 · Hero (SPEC Sekce 1)
// Fullscreen video background + velký nadpis + CTA "Více o tom co děláme".
// CTA smooth-scrolluje na #section-2 přes Lenis.

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ArrowDown } from "lucide-react";
import { asset } from "@/lib/assets";
import { useLenis } from "../providers/LenisProvider";
import { LOADER_FILL_DURATION } from "@/lib/motion";

// Placeholder poster (nahradit za /images/hero/poster.jpg jakmile bude).
const POSTER_URL =
  "https://placehold.co/1920x1080/152A3E/A8C5D6?text=Hero+Poster";

// Hero animace čekají na konec loader FILL fáze, aby naběhly viditelně
// během fadeout loaderu (vizuálně plynulý předávací moment).
const HEADLINE_DELAY = LOADER_FILL_DURATION + 0.2;
const CTA_DELAY = LOADER_FILL_DURATION + 0.5;

export function Section1Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const lenis = useLenis();

  // Fade + slide-up animace po načtení (viz SPEC Sekce 1 → Animace).
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headlineRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
          delay: HEADLINE_DELAY,
        },
      );
      gsap.fromTo(
        ctaRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
          delay: CTA_DELAY,
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const onCtaClick = () => {
    if (lenis) {
      lenis.scrollTo("#section-2");
    } else {
      // Fallback pro případ, že by byl CTA klik dřív, než se Lenis inicializuje.
      document
        .getElementById("section-2")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      ref={sectionRef}
      id="section-1"
      aria-label="Hero — Constructiva"
      className="relative h-screen w-full overflow-hidden"
    >
      {/* Gradient fallback — viditelný, když se video ani poster nenačte. */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 40%, #2a4a6a 0%, #152a3e 45%, #0d1f2d 100%)",
        }}
      />

      {/* Video background (SPEC: autoplay, muted, loop, playsInline). */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster={POSTER_URL}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        src={asset("/videos/hero/showreel.mp4")}
      />

      {/* Gradient dark overlay — top lighter, bottom darker pro čitelnost CTA. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60"
      />

      {/* Content — headline centrovaný, CTA absolutní ve spodní třetině. */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 md:px-12 lg:px-20">
        <h1
          ref={headlineRef}
          className="font-manrope font-medium text-white text-center max-w-4xl mx-auto"
          style={{
            opacity: 0,
            fontSize: "clamp(2.5rem, 5.5vw, 5.5rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          Stavíme viditelnost
          <br />
          vašich projektů
        </h1>
      </div>

      {/* CTA — absolutní ve spodní třetině, menší a decentnější. */}
      <button
        ref={ctaRef}
        type="button"
        onClick={onCtaClick}
        className="absolute bottom-16 left-1/2 z-10 -translate-x-1/2
                   inline-flex items-center gap-2
                   rounded-full border border-white/30 bg-white/15
                   px-5 py-2.5 text-sm font-medium text-white
                   backdrop-blur-md
                   hover:bg-white/25 transition-colors"
        style={{ opacity: 0 }}
      >
        <ArrowDown aria-hidden="true" className="h-3 w-3" />
        Více o tom co děláme
      </button>
    </section>
  );
}
