"use client";

// Sekce 2 · Tile Mosaic (SPEC Sekce 2)
// Mozaika 7 video dlaždic + 1 center dlaždice s text overlayem.
// Na scrollu dlaždice "slétnou" z okrajů do finální mozaiky, center tile zoom-out.

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { asset } from "@/lib/assets";

// Off-screen startovní pozice jednotlivých dlaždic (dle SPEC Scroll animace).
// Na mobilu se místo side-sweep použije jemný bottom-up slide — viz níže.
type TileSpec = {
  id: string;
  area: string;          // grid-area name
  startX: number;        // % (desktop intro)
  startY: number;        // %
  videoSrc: string;      // /videos/tiles/N.mp4
  bg: string;            // CSS gradient fallback (videa zatím nemáme)
};

const TILES: TileSpec[] = [
  {
    id: "t1", area: "t1",
    startX: -100, startY: -100,
    videoSrc: asset("/videos/tiles/1.mp4"),
    bg: "linear-gradient(135deg, #2a4a6a 0%, #152a3e 100%)",
  },
  {
    id: "t2", area: "t2",
    startX: 0, startY: -100,
    videoSrc: asset("/videos/tiles/2.mp4"),
    bg: "linear-gradient(135deg, #8a9bae 0%, #5a7088 100%)",
  },
  {
    id: "t3", area: "t3",
    startX: 100, startY: -100,
    videoSrc: asset("/videos/tiles/3.mp4"),
    bg: "linear-gradient(135deg, #152a3e 0%, #0d1f2d 100%)",
  },
  {
    id: "t4", area: "t4",
    startX: -100, startY: 0,
    videoSrc: asset("/videos/tiles/4.mp4"),
    bg: "linear-gradient(135deg, #a8c5d6 0%, #7a9fb4 100%)",
  },
  {
    id: "t5", area: "t5",
    startX: 100, startY: 0,
    videoSrc: asset("/videos/tiles/5.mp4"),
    bg: "linear-gradient(135deg, #3d5a75 0%, #152a3e 100%)",
  },
  {
    id: "t6", area: "t6",
    startX: -100, startY: 100,
    videoSrc: asset("/videos/tiles/6.mp4"),
    bg: "linear-gradient(135deg, #6b89a3 0%, #3d5a75 100%)",
  },
  {
    id: "t7", area: "t7",
    startX: 100, startY: 100,
    videoSrc: asset("/videos/tiles/7.mp4"),
    bg: "linear-gradient(135deg, #0d1f2d 0%, #2a4a6a 100%)",
  },
];

export function Section2TileMosaic() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Detekce desktopu pro plný side-sweep; na mobilu necháme jemnější slide.
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        // Desktop: dlaždice "slétnou" z okrajů.
        TILES.forEach((tile) => {
          gsap.set(`.tile-${tile.id}`, {
            xPercent: tile.startX,
            yPercent: tile.startY,
            opacity: 0,
          });
        });
        gsap.set(".center-tile", { scale: 1.3, opacity: 0.8 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "top top",
            scrub: 1,
          },
        });

        tl.to(
          TILES.map((t) => `.tile-${t.id}`).join(", "),
          {
            xPercent: 0,
            yPercent: 0,
            opacity: 1,
            duration: 1,
            ease: "power2.out",
            stagger: 0.05,
          },
        ).to(
          ".center-tile",
          { scale: 1, opacity: 1, duration: 1, ease: "power2.out" },
          "-=0.8",
        );
      });

      mm.add("(max-width: 767px)", () => {
        // Mobile: stack, každá dlaždice fade-up když najde do viewportu.
        gsap.utils.toArray<HTMLElement>(".mosaic-tile").forEach((el) => {
          gsap.set(el, { y: 40, opacity: 0 });
          gsap.to(el, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              once: true,
            },
          });
        });
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="section-2"
      aria-label="Co děláme — mozaika služeb"
      className="relative w-full overflow-hidden bg-offwhite"
    >
      {/* Desktop grid: 3×3 s grid-template-areas. Mobile: single column flex. */}
      <div className="mosaic">
        {TILES.map((tile) => (
          <Tile key={tile.id} tile={tile} />
        ))}

        {/* Center tile — text overlay a zoom-out animace */}
        <div
          className="mosaic-tile center-tile relative overflow-hidden rounded-sm bg-secondary"
          style={{ gridArea: "center" }}
        >
          {/* Pozadí (reuse showreel jako video, jinak gradient) */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, #2a4a6a 0%, #152a3e 60%, #0d1f2d 100%)",
            }}
          />
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-70"
            src={asset("/videos/hero/showreel.mp4")}
          />
          <div aria-hidden="true" className="absolute inset-0 bg-black/20" />

          {/* Text overlay — pointer-events: none aby neblokoval případné hover efekty */}
          <div className="relative z-10 flex h-full w-full items-center justify-center px-6 pointer-events-none">
            <h2
              className="text-display font-manrope font-medium text-white text-center max-w-2xl mx-auto"
              style={{ textShadow: "0 2px 20px rgba(0, 0, 0, 0.4)" }}
            >
              Váš partner v oblasti
              <br />
              stavebního marketingu
            </h2>
          </div>
        </div>
      </div>

      {/* Grid layout definice — držíme v <style jsx global> inline, protože
          Tailwind 4 nenabízí grid-template-areas jako first-class utility. */}
      <style>{`
        .mosaic {
          display: grid;
          grid-template-columns: 1fr 2fr 1fr;
          grid-template-rows: 1fr 1.5fr 1fr;
          grid-template-areas:
            "t1 t2 t3"
            "t4 center t5"
            "t6 t7 t7";
          gap: 8px;
          width: 100vw;
          height: 100vh;
          padding: 8px;
          box-sizing: border-box;
        }
        @media (max-width: 767px) {
          .mosaic {
            display: flex;
            flex-direction: column;
            height: auto;
            min-height: 100vh;
            gap: 8px;
          }
          .mosaic > div {
            grid-area: auto !important;
            width: 100%;
            aspect-ratio: 16 / 9;
          }
        }
      `}</style>
    </section>
  );
}

// Jedna video dlaždice (7×). Gradient pozadí je primary visual, dokud nemáme videa.
function Tile({ tile }: { tile: TileSpec }) {
  return (
    <div
      className={`mosaic-tile tile-${tile.id} relative overflow-hidden rounded-sm`}
      style={{ gridArea: tile.area, background: tile.bg }}
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        src={tile.videoSrc}
      />
    </div>
  );
}
