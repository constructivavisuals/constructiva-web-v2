"use client";

// Sekce 2 · Tile Mosaic (SPEC Sekce 2 + uživatelské revize)
//
// Efekt má 2 staged fáze na scrollu:
//   Fáze A (progress 0 → 0.5): centrální dlaždice se zmenšuje ze scale 2.4
//     na 1.0. Okolní dlaždice jsou skryté (opacity 0, scale 0.8).
//   Fáze B (progress 0.5 → 1.0): okolní dlaždice se objeví (opacity 0 → 1)
//     a zvětší (scale 0.8 → 1) do svých finálních grid pozic. Centrál už
//     drží scale 1.
//
// Dlaždice zůstávají VŽDY na svých grid-area pozicích — pohyb zajišťuje
// jen opacity + scale, takže nejsou potřeba off-screen translate triky.
// Pinning: CSS sticky.

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { asset } from "@/lib/assets";

type TileSpec = {
  id: string;
  area: string;       // grid-area name
  videoSrc: string;
  bg: string;         // gradient fallback dokud není video
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

// Center — vlastní (3.) nezávislé video, scale 2.4 pokrývá celý viewport.
const CENTER_INIT_SCALE = 2.4;
const CENTER_VIDEO = asset("/videos/tiles/center.mp4");
const CENTER_BG =
  "radial-gradient(ellipse at center, #2a4a6a 0%, #152a3e 60%, #0d1f2d 100%)";

export function Section2TileMosaic() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        // Fáze A — centrál 2.4 → 1 přes první polovinu scroll spanu.
        gsap.to(".center-tile", {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
          },
        });

        // Fáze B — okolní tiles se objeví v druhé polovině scrollu.
        // start '50% top' = trigger.50% dosáhne viewport.top (= v půlce scroll spanu).
        gsap.to(
          TILES.map((t) => `.tile-${t.id}`).join(", "),
          {
            opacity: 1,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "50% top",
              end: "bottom bottom",
              scrub: 1,
            },
          },
        );
      });

      // Mobile: žádné JS animace. CSS @media přebije inline styly.
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
      <div className="w-full md:sticky md:top-0 md:h-screen md:overflow-hidden">
        <div className="mosaic">
          {TILES.map((tile) => (
            <Tile key={tile.id} tile={tile} />
          ))}

          {/* Center tile — vlastní video, text overlay, z-index 10 */}
          <div
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
          Mobile resetuje grid a ruší inline transform/opacity přes !important. */}
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
            transform: none !important;
            opacity: 1 !important;
            z-index: auto !important;
          }
        }
      `}</style>
    </section>
  );
}

function Tile({ tile }: { tile: TileSpec }) {
  // SSR počáteční stav — skryté, mírně zmenšené.
  // Na desktopu GSAP animuje opacity + scale na 1.
  // Na mobilu CSS @media přebije opacity: 1 !important.
  return (
    <div
      className={`mosaic-tile tile-${tile.id} relative overflow-hidden rounded-sm`}
      style={{
        gridArea: tile.area,
        background: tile.bg,
        opacity: 0,
        transform: "scale(0.8)",
        transformOrigin: "center center",
        willChange: "opacity, transform",
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
