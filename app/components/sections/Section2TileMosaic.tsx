"use client";

// Sekce 2 · Tile Mosaic (SPEC Sekce 2 + uživatelské revize)
//
// Efekt: na začátku zabírá centrální dlaždice CELÝ viewport (vypadá jako
// pokračování Hera). 6 okolních dlaždic je skutečně MIMO viewport — každá
// o 100vw / 100vh ve směru své grid pozice. Scrollem (pinned) se okolní
// dlaždice sesunou do svých grid pozic a centrální se zmenší z 2.4 na 1.0.
//
// KLÍČ: počáteční pozice používají vw/vh (viewport units), ne % (které by
// byly relativní k velikosti samotné dlaždice — a ta nezabírá celý
// viewport, takže -100% ji posune jen o její velikost, tedy pořád viditelně).
//
// Pinning: CSS sticky (ne GSAP pin). invalidateOnRefresh: true zajistí
// přepočet px-hodnot na window.resize.

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { asset } from "@/lib/assets";

type TileSpec = {
  id: string;
  area: string;       // grid-area name
  initX: number;      // násobek 100vw: −1 = mimo doleva, +1 = mimo doprava
  initY: number;      // násobek 100vh: −1 = mimo nahoru, +1 = mimo dolů
  videoSrc: string;
  bg: string;         // gradient fallback dokud není video
};

const TILES: TileSpec[] = [
  { id: "t1", area: "t1", initX: -1, initY: -1,
    videoSrc: asset("/videos/tiles/1.mp4"),
    bg: "linear-gradient(135deg, #2a4a6a 0%, #152a3e 100%)" },
  { id: "t2", area: "t2", initX:  0, initY: -1,
    videoSrc: asset("/videos/tiles/2.mp4"),
    bg: "linear-gradient(135deg, #8a9bae 0%, #5a7088 100%)" },
  { id: "t3", area: "t3", initX:  1, initY: -1,
    videoSrc: asset("/videos/tiles/3.mp4"),
    bg: "linear-gradient(135deg, #152a3e 0%, #0d1f2d 100%)" },
  { id: "t4", area: "t4", initX: -1, initY:  0,
    videoSrc: asset("/videos/tiles/4.mp4"),
    bg: "linear-gradient(135deg, #a8c5d6 0%, #7a9fb4 100%)" },
  { id: "t5", area: "t5", initX:  1, initY:  0,
    videoSrc: asset("/videos/tiles/5.mp4"),
    bg: "linear-gradient(135deg, #3d5a75 0%, #152a3e 100%)" },
  { id: "t6", area: "t6", initX: -1, initY:  1,
    videoSrc: asset("/videos/tiles/6.mp4"),
    bg: "linear-gradient(135deg, #6b89a3 0%, #3d5a75 100%)" },
  { id: "t7", area: "t7", initX:  1, initY:  1,
    videoSrc: asset("/videos/tiles/7.mp4"),
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

      // Desktop: pinned scroll-driven fly-in z mimo-viewport.
      mm.add("(min-width: 768px)", () => {
        // Function-valued x/y → GSAP přepočítá při každém refresh (resize).
        TILES.forEach((t) => {
          gsap.set(`.tile-${t.id}`, {
            x: () => t.initX * window.innerWidth,
            y: () => t.initY * window.innerHeight,
          });
        });
        gsap.set(".center-tile", { scale: CENTER_INIT_SCALE });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        // Každá dlaždice má svůj fromTo (per-tile function values).
        // Start v čase 0 ("position 0" parametr) → paralelně.
        TILES.forEach((t) => {
          tl.fromTo(
            `.tile-${t.id}`,
            {
              x: () => t.initX * window.innerWidth,
              y: () => t.initY * window.innerHeight,
            },
            { x: 0, y: 0, ease: "none" },
            0,
          );
        });

        tl.to(".center-tile", { scale: 1, ease: "none" }, 0);
      });

      // Mobile: žádná JS animace. CSS @media resetuje inline transformy.
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
      {/* Sticky pin (CSS-only) + overflow-hidden ořízne dlaždice mimo viewport. */}
      <div className="w-full md:sticky md:top-0 md:h-screen md:overflow-hidden">
        <div className="mosaic">
          {TILES.map((tile) => (
            <Tile key={tile.id} tile={tile} />
          ))}

          {/* Center tile — vlastní video, text overlay, z-index aby překryla
              okolní rohy během počátečního scale 2.4. */}
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
          Mobile resetuje grid + ruší inline transform/zIndex přes !important. */}
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
            z-index: auto !important;
          }
        }
      `}</style>
    </section>
  );
}

function Tile({ tile }: { tile: TileSpec }) {
  // SSR inline transform používá vw/vh — skutečné mimo-viewport pozice,
  // ne % relativní k velikosti dlaždice.
  const initTransform = `translate(${tile.initX * 100}vw, ${tile.initY * 100}vh)`;
  return (
    <div
      className={`mosaic-tile tile-${tile.id} relative overflow-hidden rounded-sm`}
      style={{
        gridArea: tile.area,
        background: tile.bg,
        transform: initTransform,
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
        src={tile.videoSrc}
      />
    </div>
  );
}
