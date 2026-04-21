"use client";

// Lenis smooth-scroll provider + React Context (SPEC 2.2).
// useLenis() poskytuje Lenis instanci child komponentám — potřebujeme v:
//   - Section0Loader (stop/start během loaderu)
//   - Section1Hero CTA (scrollTo('#section-2'))
//   - Section8 scroll-to-top button
//
// Lenis je napojen na GSAP ticker → ScrollTrigger.scrub animace šlapou synchronně.

import { createContext, useContext, useEffect, useState } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const LenisContext = createContext<Lenis | null>(null);

export function useLenis(): Lenis | null {
  return useContext(LenisContext);
}

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const instance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    instance.on("scroll", ScrollTrigger.update);
    const rafTick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(rafTick);
    gsap.ticker.lagSmoothing(0);

    setLenis(instance);

    return () => {
      gsap.ticker.remove(rafTick);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
