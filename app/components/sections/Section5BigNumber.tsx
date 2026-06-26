"use client";

// Sekce 5 · Big Number Reveal (SPEC Sekce 5)
//
// Fullscreen pinned sekce s jedním velkým číslem a CountUp animací.
// Section h-[200vh] (desktop) / h-[150vh] (mobile), uvnitř sticky h-screen.
//
// Timeline (pin přes sticky, scrub jen pro EXIT):
//   ENTRY (one-shot, fire při vjezdu): topText → number (+ CountUp 0→1 000 000)
//          → bottomText. CountUp = gsap.to proxy { val }, formátování onUpdate.
//   HOLD  : vše drží, jemný parallax na rozmazaném pozadí (jen desktop).
//   EXIT  (scrub, posledních 30 %): celý stack opacity→0, scale→0.95, y→-40.

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { asset } from "@/lib/assets";

// "1 000 000" s nezalomitelnou mezerou (U+00A0) jako tisíce-separátor.
function formatCZK(num: number): string {
  return Math.floor(num).toLocaleString("cs-CZ").replace(/[\s,]/g, " ");
}

export function Section5BigNumber() {
  const sectionRef = useRef<HTMLElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const topTextRef = useRef<HTMLParagraphElement>(null);
  const numberRef = useRef<HTMLDivElement>(null);
  const bottomTextRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const stack = stackRef.current;
    const bg = bgRef.current;
    const topText = topTextRef.current;
    const number = numberRef.current;
    const bottomText = bottomTextRef.current;
    if (!section || !stack || !topText || !number || !bottomText) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: "(min-width: 768px)",
        isMobile: "(max-width: 767px)",
      },
      (ctx) => {
        const isDesktop = ctx.conditions?.isDesktop ?? false;

        // ── Výchozí stav (před vjezdem do viewportu) ──
        gsap.set(topText, { opacity: 0, y: -30 });
        gsap.set(number, { opacity: 0, y: 40, scale: 0.9 });
        gsap.set(bottomText, { opacity: 0, y: 30 });
        number.textContent = "0";

        // ── ENTRY — one-shot, hraje při vjezdu sekce do viewportu ──
        const proxy = { val: 0 };
        const entry = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        });

        entry
          .to(topText, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 0)
          .to(
            number,
            { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power2.out" },
            0.15,
          )
          .to(
            proxy,
            {
              val: 1_000_000,
              duration: 1.8,
              ease: "power3.out",
              onUpdate: () => {
                number.textContent = formatCZK(proxy.val);
              },
              onComplete: () => {
                number.textContent = formatCZK(1_000_000);
              },
            },
            0.15,
          )
          .to(
            bottomText,
            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
            0.5,
          );

        // ── EXIT (+ parallax) — scrub vázaný na scroll skrz pin ──
        // Timeline o délce 1: hold drží 0–0.7, exit hraje 0.7–1.0.
        const exit = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
          },
        });

        // Jemný parallax na rozmazaném pozadí (jen desktop).
        if (isDesktop && bg) {
          exit.to(bg, { y: -50, ease: "none", duration: 1 }, 0);
        }

        // Exit celého stacku v posledních 30 %.
        exit.to(
          stack,
          { opacity: 0, scale: 0.95, y: -40, ease: "none", duration: 0.3 },
          0.7,
        );
      },
    );

    return () => {
      mm.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="section-5"
      aria-label="Sekce 5 — Přes milion časosběrných fotografií"
      className="relative h-[150vh] md:h-[200vh]"
    >
      <div
        className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#FAFAFA] to-[#EEF2F6]"
      >
        {/* Rozmazané pozadí ze staveniště */}
        <div
          ref={bgRef}
          aria-hidden="true"
          className="absolute inset-0 opacity-20 blur-3xl"
          style={{
            backgroundImage: `url('${asset("/images/portal/mockup-bg-blur.png")}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            willChange: "transform",
          }}
        />

        {/* Centrovaný obsah */}
        <div
          ref={stackRef}
          className="relative z-10 max-w-6xl px-6 text-center md:px-8"
          style={{ willChange: "transform, opacity" }}
        >
          <p
            ref={topTextRef}
            className="mb-6 text-lg font-light tracking-wide text-[#5A6B7C] md:mb-8 md:text-xl"
          >
            Vyfotili jsme přes
          </p>

          <div
            ref={numberRef}
            className="font-bold leading-none tracking-tight tabular-nums text-[#152A3E] text-[clamp(4rem,22vw,8rem)] md:text-[clamp(6rem,18vw,20rem)]"
          >
            0
          </div>

          <p
            ref={bottomTextRef}
            className="mt-6 text-lg font-light tracking-wide text-[#5A6B7C] md:mt-8 md:text-xl"
          >
            časosběrných fotografií
          </p>
        </div>
      </div>
    </section>
  );
}
