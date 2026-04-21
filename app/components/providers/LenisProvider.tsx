"use client";

// Lenis smooth-scroll provider napojený na GSAP ScrollTrigger.
// (SPEC 2.2) — zajišťuje, že scrub animace šlapou synchronně s Lenis rAF.

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    // Napoj Lenis na GSAP ticker + ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);
    const rafTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(rafTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(rafTick);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
