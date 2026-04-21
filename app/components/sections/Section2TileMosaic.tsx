"use client";

// Sekce 2 · Tile Mosaic (SPEC Sekce 2 — minimalistická implementace)
//
// Okolní dlaždice jsou STATICKÉ — vždy na svých grid pozicích, žádná JS
// animace. Celou dobu viditelné, ale na začátku jsou překryté zvětšeným
// centrálem (z-index 10). Jak se centrál zmenšuje přes scroll, postupně
// odhaluje okolní tiles.
//
// Jediná animace: scale 2.4 → 1 na centrálu, scrub-řízená ScrollTriggerem.
// Pinning: CSS sticky.

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { asset } from "@/lib/assets";

type TileSpec = {
  id: string;
  area: string;
  videoSrc: string;
  bg: string;
};

const TILES: TileSpec[] = [
  { id: "t1", area: "t1", videoSrc: asset("/videos/tiles/1.mp4"),
    bg: "linear-gradient(135deg, #2a4a6a 0%, #152a3e 100%)" },
  { id: "t2", area: "t2", videoSrc: asset("/videos/tiles/2.mp4"),
    bg: "linear-gradient(135deg, #8a9bae 0%, #5a7088 100%)" },
  { id: "t3", area: "t3", videoSrc: asset("/videos/tiles/3.mp4"),
    bg: "linear-gradient(135deg, #152a3e 0%, #0d1f2d 100%)" },
  { id: "t4", area: "t4", videoSrc: asset("/videos/tiles/4.mp4"),
    bg: "linear-gradient(135deg, #a8c5d6 0%, #7a9fb4 100%)" },
  { id: "t5", area: "t5", videoSrc: asset("/videos/tiles/5.mp4"),
    bg: "linear-gradient(135deg, #3d5a75 0%, #152a3e 100%)" },
  { id: "t6", area: "t6", videoSrc: asset("/videos/tiles/6.mp4"),
    bg: "linear-gradient(135deg, #6b89a3 0%, #3d5a75 100%)" },
  { id: "t7", area: "t7", videoSrc: asset("/videos/tiles/7.mp4"),
    bg: "linear-gradient(135deg, #0d1f2d 0%, #2a4a6a 100%)" },
];

// Center tile — vlastní video, scale 2.4 pokrývá celý viewport.
const CENTER_INIT_SCALE = 2.4;
const CENTER_VIDEO = asset("/videos/tiles/center.mp4");
const CENTER_BG =
  "radial-gradient(ellipse at center, #2a4a6a 0%, #152a3e 60%, #0d1f2d 100%)";

export function Section2TileMosaic() {
  const sectionRef = useRef<HTMLElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const center = centerRef.current;
    if (!section || !center) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Desktop: jediná animace — centrál scale 2.4 → 1.
      mm.add("(min-width: 768px)", () => {
        gsap.to(center, {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
          },
        });
      });

      // Mobile: žádná JS animace. CSS @media přebije inline scale.
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="section-2"
      aria-label="Co děláme — mozaika služeb"
      className="relative w-full overflow-hidden bg-offwhite md:h-[200vh]"
    >
      {/* Sticky pin (CSS-only). overflow-hidden je kritický — při scale 2.4
          by centrál přesahoval viewport a roztahoval scrollbar. */}
      <div className="w-full md:sticky md:top-0 md:h-screen md:w-screen md:overflow-hidden">
        <div className="mosaic">
          {TILES.map((tile) => (
            <Tile key={tile.id} tile={tile} />
          ))}

          {/* Center tile — jediná animovaná. Inline scale(2.4) je SSR-stable
              počáteční stav; GSAP to animuje na scale(1) přes scrub. */}
          <div
            ref={centerRef}
            className="mosaic-tile center-tile relative overflow-hidden rounded-sm"
            style={{
              gridArea: "center",
              background: CENTER_BG,
              transform: `scale(${CENTER_INIT_SCALE})`,
              transformOrigin: "center center",
              zIndex: 10,
              willChange: "transform",
            }}
          >
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover"
              src={CENTER_VIDEO}
            />
            <div aria-hidden="true" className="absolute inset-0 bg-black/20" />

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
      </div>

      {/* Grid layout (Tailwind 4 nemá grid-template-areas utility).
          Mobile resetuje grid + ruší inline scale/z-index přes !important. */}
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
          width: 100%;
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
            padding: 8px;
          }
          .mosaic > div {
            grid-area: auto !important;
            width: 100%;
            aspect-ratio: 16 / 9;
          }
          .mosaic .center-tile {
            transform: none !important;
            z-index: auto !important;
          }
        }
      `}</style>
    </section>
  );
}

// Okolní dlaždice — statické. Žádný transform, žádná opacity, žádný GSAP.
function Tile({ tile }: { tile: TileSpec }) {
  return (
    <div
      className={`mosaic-tile tile-${tile.id} relative overflow-hidden rounded-sm`}
      style={{
        gridArea: tile.area,
        background: tile.bg,
      }}
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
