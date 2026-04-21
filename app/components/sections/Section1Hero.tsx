"use client";

// Sekce 1 · Hero (SPEC Sekce 1)
// Fullscreen video background + nadpis + glass pill CTA s logem uvnitř.
// CTA smooth-scrolluje na #section-2 přes Lenis.

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { asset } from "@/lib/assets";
import { useLenis } from "../providers/LenisProvider";
import { LOADER_FILL_DURATION } from "@/lib/motion";

// Hero animace čekají na konec loader FILL fáze → vizuálně plynulý předávací
// moment (headline začne fade-up během fade-outu loaderu).
const HEADLINE_DELAY = LOADER_FILL_DURATION + 0.2; // 2.4s
const CTA_DELAY = LOADER_FILL_DURATION + 0.5;      // 2.7s

export function Section1Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

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
        [ctaRef.current, scrollHintRef.current],
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
          delay: CTA_DELAY,
          stagger: 0.1,
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleScrollDown = () => {
    if (lenis) {
      lenis.scrollTo("#section-2");
    } else {
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
      style={{ backgroundColor: "var(--color-neutral)" }}
    >
      {/* Video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster={asset("/images/hero/poster.jpg")}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        src={asset("/videos/hero/showreel.mp4")}
      />

      {/* Gradient overlay — top lighter (video vidět), bottom darker (CTA čitelná) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* Content — headline posazen do spodnější třetiny viewportu */}
      <div className="relative z-10 h-full flex flex-col items-center justify-start px-6 pt-[38vh]">
        <h1
          ref={headlineRef}
          className="font-manrope text-white text-center max-w-5xl"
          style={{
            opacity: 0,
            fontSize: "clamp(2.5rem, 6vw, 5.5rem)",
            fontWeight: 500,
            lineHeight: 1.08,
            letterSpacing: "-0.025em",
            textShadow: "0 2px 24px rgba(0, 0, 0, 0.35)",
          }}
        >
          Stavíme viditelnost<br />vašich projektů
        </h1>
      </div>

      {/* CTA pill — glass styl shodný s Navem, uvnitř malé logo + popisek */}
      <button
        ref={ctaRef}
        type="button"
        onClick={handleScrollDown}
        className="z-10 inline-flex items-center gap-3 text-white transition-opacity hover:opacity-90"
        style={{
          position: "absolute",
          bottom: "32px",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: 0,
          background: "rgba(255, 255, 255, 0.12)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "9999px",
          padding: "8px 20px 8px 8px",
          fontSize: "14px",
          fontWeight: 500,
        }}
      >
        <span
          className="flex items-center justify-center rounded-full"
          style={{
            width: "32px",
            height: "32px",
            background: "var(--color-secondary)",
          }}
          aria-hidden="true"
        >
          <Image
            src="/images/logo.svg"
            alt=""
            width={60}
            height={16}
            className="h-3 w-auto object-contain"
            style={{ filter: "invert(1)" }}
          />
        </span>
        Více o tom co děláme
      </button>

      {/* Scroll down indikátor — vpravo dole, decentní */}
      <div
        ref={scrollHintRef}
        aria-hidden="true"
        className="absolute bottom-8 right-8 z-10 flex items-center gap-3 text-white text-sm"
        style={{ opacity: 0 }}
      >
        <span
          className="relative flex items-start justify-center"
          style={{
            width: "18px",
            height: "28px",
            border: "1px solid rgba(255, 255, 255, 0.6)",
            borderRadius: "9999px",
          }}
        >
          <span
            className="mt-1.5"
            style={{
              width: "2px",
              height: "6px",
              background: "rgba(255, 255, 255, 0.8)",
              borderRadius: "9999px",
            }}
          />
        </span>
        Scroll down
      </div>
    </section>
  );
}
