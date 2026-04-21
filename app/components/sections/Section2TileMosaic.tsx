"use client";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { asset } from "@/lib/assets";

export function Section2TileMosaic() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !gridRef.current || !centerRef.current) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      // Počáteční stav: celý grid scale(2) s origin na centrálu.
      // Centrál (2fr z 1+2+1 cols = 50 % gridu) dominuje viewportu; okolí je mimo.
      gsap.set(gridRef.current, { scale: 2, transformOrigin: "center center" });

      // Scroll: grid scale 2 → 1 → plná mozaika.
      gsap.to(gridRef.current, {
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });
    });

    return () => mm.revert();
  }, []);

  const tiles = [1, 2, 3, 4, 5, 6, 7];

  return (
    <section
      ref={sectionRef}
      id="section-2"
      className="relative h-[200vh] bg-offwhite"
    >
      <div
        ref={stickyRef}
        className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center"
      >
        <div ref={gridRef} className="mosaic-grid">
          {/* 7 okolních dlaždic */}
          {tiles.map((n) => (
            <div key={n} className={`tile tile-${n}`}>
              <div className="tile-fallback" />
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="tile-video"
              >
                <source src={asset(`/videos/tiles/${n}.mp4`)} type="video/mp4" />
              </video>
            </div>
          ))}

          {/* Centrální dlaždice */}
          <div ref={centerRef} className="tile tile-center">
            <div className="tile-fallback tile-fallback-center" />
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="tile-video"
            >
              <source src={asset("/videos/tiles/center.mp4")} type="video/mp4" />
            </video>
            <h2 className="tile-heading">
              Váš partner v oblasti
              <br />
              stavebního marketingu
            </h2>
          </div>
        </div>
      </div>

      <style jsx>{`
        .mosaic-grid {
          display: grid;
          grid-template-columns: 1fr 2fr 1fr;
          grid-template-rows: 1fr 1.5fr 1fr;
          grid-template-areas:
            "t1 t2 t3"
            "t4 tc t5"
            "t6 t7 t7";
          gap: 8px;
          width: 100vw;
          height: 100vh;
          padding: 8px;
        }
        .tile {
          position: relative;
          overflow: hidden;
          border-radius: 8px;
          background: var(--color-neutral);
        }
        .tile-1 { grid-area: t1; }
        .tile-2 { grid-area: t2; }
        .tile-3 { grid-area: t3; }
        .tile-4 { grid-area: t4; }
        .tile-5 { grid-area: t5; }
        .tile-6 { grid-area: t6; }
        .tile-7 { grid-area: t7; }
        .tile-center { grid-area: tc; }
        .tile-fallback {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, var(--color-secondary), var(--color-primary));
        }
        .tile-fallback-center {
          background: radial-gradient(circle, var(--color-secondary), var(--color-neutral));
        }
        .tile-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .tile-heading {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: white;
          font-family: var(--font-manrope), sans-serif;
          font-weight: 500;
          font-size: clamp(1.5rem, 3vw, 3rem);
          line-height: 1.1;
          padding: 1rem;
          text-shadow: 0 2px 20px rgba(0, 0, 0, 0.4);
          pointer-events: none;
          z-index: 2;
        }
        @media (max-width: 767px) {
          .mosaic-grid {
            display: flex;
            flex-direction: column;
            height: auto;
            gap: 12px;
          }
          .tile {
            aspect-ratio: 16 / 9;
          }
        }
      `}</style>
    </section>
  );
}
