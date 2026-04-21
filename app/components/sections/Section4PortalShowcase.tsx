"use client";

// Sekce 4 · Portal Showcase (SPEC Sekce 4)
// Úkol 4a: Fáze A + B.
//   Fáze A (0 → 40 % scrollu): fotka laptopu na staveništi, fullscreen, statická.
//   Fáze B (40 → 100 %): scroll scrubem zoom do obrazovky laptopu (scale 1 → 1.85).
// Fáze C (pinned 3-column showcase) přijde v dalším kroku.

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { asset } from "@/lib/assets";

export function Section4PortalShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const mockup = mockupRef.current;
    if (!section || !mockup) return;

    const mm = gsap.matchMedia();

    // Desktop: scroll-driven zoom do obrazovky laptopu v druhé polovině scrollu.
    mm.add("(min-width: 768px)", () => {
      gsap.fromTo(
        mockup,
        { scale: 1 },
        {
          scale: 1.85,
          ease: "none",
          force3D: true,
          scrollTrigger: {
            trigger: section,
            start: "40% top",
            end: "bottom bottom",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        },
      );
    });

    // Mobile: žádná animace — CSS sticky s fotkou beze změny.

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="section-4"
      aria-label="Klientský portál — showcase"
      className="relative h-[300vh] bg-black"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div
          ref={mockupRef}
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${asset("/images/portal/mockup.png")})`,
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
            transformOrigin: "center center",
            willChange: "transform",
          }}
        />
      </div>
    </section>
  );
}
