"use client";

// Sekce 3 · Bosch Scroll Sequence (SPEC Sekce 3)
//
// Pinned canvas animace. 130 framů stavby se rozvíjí podle scroll progress.
// Přes canvas jsou 3 crossfade nadpisy (Časosběry / Video / Fotografie)
// a sticky CTA dole "Domluvte si s námi schůzku".
//
// Framy jsou lazy-preloadnuty paralelně při mount, canvas render běží
// v onUpdate ScrollTriggeru (požadavek: render jen při změně frameIndex).

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import { asset } from "@/lib/assets";

const FRAMES_COUNT = 130; // později 300 (dle SPEC)
const framePath = (i: number) =>
  asset(
    `/images/bosch-sequence/frames/frame-${String(i).padStart(3, "0")}.jpg`,
  );

export function Section3BoschSequence() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const casosberyRef = useRef<HTMLHeadingElement>(null);
  const videoRef = useRef<HTMLHeadingElement>(null);
  const fotoRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const c2d = canvas.getContext("2d");
    if (!c2d) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();

    // Preload všech 130 framů paralelně.
    const images: HTMLImageElement[] = [];
    for (let i = 1; i <= FRAMES_COUNT; i++) {
      const img = new Image();
      img.src = framePath(i);
      images.push(img);
    }

    let currentFrame = -1;

    const render = (i: number) => {
      const img = images[i];
      if (!img?.complete || !img.naturalWidth) return;
      c2d.clearRect(0, 0, canvas.width, canvas.height);
      // Cover behavior — škáluj obrázek aby pokryl canvas, centrovaně.
      const scale = Math.max(
        canvas.width / img.naturalWidth,
        canvas.height / img.naturalHeight,
      );
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      const x = (canvas.width - w) / 2;
      const y = (canvas.height - h) / 2;
      c2d.drawImage(img, x, y, w, h);
    };

    // Kresli první frame jakmile bude načtený (i kdyby ostatní ještě nebyly).
    const drawFirstWhenReady = () => {
      if (currentFrame === -1) {
        currentFrame = 0;
        render(0);
      }
    };
    if (images[0].complete) drawFirstWhenReady();
    else images[0].addEventListener("load", drawFirstWhenReady, { once: true });

    const onResize = () => {
      setCanvasSize();
      render(currentFrame === -1 ? 0 : currentFrame);
    };
    window.addEventListener("resize", onResize);

    // Phase text crossfade — direct inline opacity + CSS transition.
    const setPhase = (progress: number) => {
      const a = progress < 0.33 ? 1 : 0;
      const b = progress >= 0.33 && progress < 0.66 ? 1 : 0;
      const c = progress >= 0.66 ? 1 : 0;
      if (casosberyRef.current) casosberyRef.current.style.opacity = String(a);
      if (videoRef.current) videoRef.current.style.opacity = String(b);
      if (fotoRef.current) fotoRef.current.style.opacity = String(c);
    };

    const gctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
        onUpdate: (self) => {
          const i = Math.floor(self.progress * (FRAMES_COUNT - 1));
          if (i !== currentFrame) {
            currentFrame = i;
            render(i);
          }
          setPhase(self.progress);
        },
      });
    }, section);

    return () => {
      window.removeEventListener("resize", onResize);
      gctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="section-3"
      aria-label="Stavíme s přehledem — časosběry, video, fotografie"
      className="relative h-[400vh]"
    >
      {/* Sticky pin (CSS). overflow-hidden — canvas cover může přesahovat viewport. */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-neutral">
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
        />

        {/* Dark overlay pro čitelnost textu */}
        <div aria-hidden="true" className="absolute inset-0 bg-black/30" />

        {/* Phase text — 3 <h2> stacknuté, crossfade přes opacity */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <h2
            ref={casosberyRef}
            className="phase-text"
            style={{ opacity: 1 }}
          >
            Časosběry
          </h2>
          <h2 ref={videoRef} className="phase-text" style={{ opacity: 0 }}>
            Video
          </h2>
          <h2 ref={fotoRef} className="phase-text" style={{ opacity: 0 }}>
            Fotografie
          </h2>
        </div>

        {/* Sticky CTA bottom — reálný modal v Úkolu #7 */}
        <div className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2">
          <button
            type="button"
            onClick={() => alert("Modal coming soon")}
            className="inline-flex items-center gap-2 rounded-full bg-white
                       px-8 py-4 text-sm font-medium text-secondary
                       shadow-lg transition-transform hover:scale-105"
          >
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
            Domluvte si s námi schůzku
          </button>
        </div>
      </div>

    </section>
  );
}
