"use client";

// Sekce 2 · Tile Mosaic (SPEC Sekce 2 + uživatelská revize)
//
// Efekt: na začátku zabírá centrální dlaždice CELÝ viewport (vypadá jako
// pokračování Hera). 6 okolních dlaždic je posunutých mimo viewport o 100 %
// své vlastní velikosti (top-left mimo nahoru-vlevo, top-center mimo nahoru,
// atd.). Scrollem (pinned) se okolní dlaždice slétnou do svých grid pozic
// a centrální dlaždice se zmenší ze scale 2.4 na 1.0 — výsledkem je plná
// 3×3 mozaika.
//
// Pinning řeší CSS sticky (ne GSAP `pin:`) — vyhneme se flicku během
// hydratace a duplicitě s GSAP pin spacerem.

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { asset } from "@/lib/assets";

type TileSpec = {
  id: string;
  area: string;       // grid-area name
  initX: number;      // % off-screen direction (−100 = mimo doleva)
  initY: number;      // % off-screen direction (−100 = mimo nahoru)
  videoSrc: string;
  bg: string;         // gradient fallback dokud není video
};

const TILES: TileSpec[] = [
  { id: "t1", area: "t1", initX: -100, initY: -100,
    videoSrc: asset("/videos/tiles/1.mp4"),
    bg: "linear-gradient(135deg, #2a4a6a 0%, #152a3e 100%)" },
  { id: "t2", area: "t2", initX:    0, initY: -100,
    videoSrc: asset("/videos/tiles/2.mp4"),
    bg: "linear-gradient(135deg, #8a9bae 0%, #5a7088 100%)" },
  { id: "t3", area: "t3", initX:  100, initY: -100,
    videoSrc: asset("/videos/tiles/3.mp4"),
    bg: "linear-gradient(135deg, #152a3e 0%, #0d1f2d 100%)" },
  { id: "t4", area: "t4", initX: -100, initY:    0,
    videoSrc: asset("/videos/tiles/4.mp4"),
    bg: "linear-gradient(135deg, #a8c5d6 0%, #7a9fb4 100%)" },
  { id: "t5", area: "t5", initX:  100, initY:    0,
    videoSrc: asset("/videos/tiles/5.mp4"),
    bg: "linear-gradient(135deg, #3d5a75 0%, #152a3e 100%)" },
  { id: "t6", area: "t6", initX: -100, initY:  100,
    videoSrc: asset("/videos/tiles/6.mp4"),
    bg: "linear-gradient(135deg, #6b89a3 0%, #3d5a75 100%)" },
  { id: "t7", area: "t7", initX:  100, initY:  100,
    videoSrc: asset("/videos/tiles/7.mp4"),
    bg: "linear-gradient(135deg, #0d1f2d 0%, #2a4a6a 100%)" },
];

// Center tile — vlastní (3.) nezávislé video.
// Scale výpočet: viewport / center-area-velikost.
//   width: 100vw / (2/4 = 50vw) = 2.0
//   height: 100vh / (1.5/3.5 ≈ 42.86vh) ≈ 2.33
// Bereme max + malou rezervu kvůli grid gap/padding → 2.4
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

      // Desktop: pinned scroll-driven fly-in.
      // Pinning zařizuje CSS sticky na wrapper divu — ScrollTrigger jen scrubuje.
      mm.add("(min-width: 768px)", () => {
        // Synchronizuj GSAP transform cache s inline transform z SSR.
        TILES.forEach((t) => {
          gsap.set(`.tile-${t.id}`, {
            xPercent: t.initX,
            yPercent: t.initY,
          });
        });
        gsap.set(".center-tile", { scale: CENTER_INIT_SCALE });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
          },
        });

        // Paralelně (oba ", 0" na konci → start v čase 0):
        // - 6 okolních dlaždic: zpět do (0, 0)
        // - center tile: scale 2.4 → 1.0
        tl.to(
          TILES.map((t) => `.tile-${t.id}`).join(", "),
          { xPercent: 0, yPercent: 0, ease: "none" },
          0,
        ).to(
          ".center-tile",
          { scale: 1, ease: "none" },
          0,
        );
      });

      // Mobile: žádné JS animace, dlaždice viditelné rovnou.
      // CSS @media níže resetuje inline transform na none !important.
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="section-2"
      aria-label="Co děláme — mozaika služeb"
      className="relative w-full bg-offwhite md:h-[200vh]"
    >
      {/* Sticky pin (CSS-only). Na mobilu obyčejný div bez clippingu. */}
      <div className="w-full md:sticky md:top-0 md:h-screen md:overflow-hidden">
        <div className="mosaic">
          {TILES.map((tile) => (
            <Tile key={tile.id} tile={tile} />
          ))}

          {/* Center tile — vlastní video, text overlay,
              z-index 10 aby překryla okolní rohy během počátečního scale. */}
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

            {/* Text overlay — viditelný po celou dobu, neblokuje hover */}
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
          Mobile resetuje grid + ruší inline transform přes !important. */}
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
  return (
    <div
      className={`mosaic-tile tile-${tile.id} relative overflow-hidden rounded-sm`}
      style={{
        gridArea: tile.area,
        background: tile.bg,
        transform: `translate(${tile.initX}%, ${tile.initY}%)`,
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
