"use client";

// Sekce 4 · Portal Showcase (Relats-style)
//
// Tři fáze napříč ~500vh scrollem, celá sekce pinned přes CSS sticky:
//
//   A (0 – 15 %): fullscreen mockup.png, statická. Scroll hint dole.
//   B (15 – 55 %): zoom do sidebaru laptopu (scale 1 → 4.5,
//       origin 24 % 50 %, blur 0 → 6px). V posledních 15 % fáze B
//       crossfade na mockup-bg-blur.png. V posledních 10 % fade-in
//       HTML fáze C.
//   C (55 – 100 %): pinned 3-column layout (video / sidebar / info).
//       Scroll-spy přepíná 6 služeb po 7.5 % progressu.

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Layers,
  Zap,
  Camera,
  Folder,
  Film,
  Clock,
  Video,
  CheckCircle,
  Share2,
  PenTool,
  Cloud,
  LayoutDashboard,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { asset } from "@/lib/assets";

type Metric = { icon: LucideIcon; label: string; value: string };

type Service = {
  id: string;
  label: string;        // sidebar label (Titlecase)
  title: string;        // hero nadpis pravé karty (UPPERCASE)
  icon: LucideIcon;
  metrics: [Metric, Metric];
  description: string;
  cta: string;
  video: string;
};

const SERVICES: Service[] = [
  {
    id: "vizualizace",
    label: "Vizualizace",
    title: "VIZUALIZACE",
    icon: Layers,
    metrics: [
      { icon: Layers, label: "FORMÁT", value: "Fotorealistické 3D rendery" },
      { icon: Zap, label: "DODÁNÍ", value: "Realizace od 2 týdnů" },
    ],
    description:
      "Architektonické vizualizace hal, elektráren a průmyslových areálů. Ukažte klientům stavbu dřív, než se kopne do země.",
    cta: "Více o vizualizacích",
    video: asset("/videos/portal/vizualizace.mp4"),
  },
  {
    id: "dokumentace",
    label: "Dokumentace",
    title: "DOKUMENTACE",
    icon: Camera,
    metrics: [
      { icon: Camera, label: "VÝJEZDY", value: "Pravidelné výjezdy" },
      { icon: Folder, label: "REPORTING", value: "Měsíční reporty" },
    ],
    description:
      "Profesionální fotodokumentace průběhu stavby. Archiv, reporty a předávací protokoly strukturovaně v portálu.",
    cta: "Více o dokumentaci",
    video: asset("/videos/portal/dokumentace.mp4"),
  },
  {
    id: "casosbery",
    label: "Časosběry",
    title: "ČASOSBĚRY",
    icon: Film,
    metrics: [
      { icon: Film, label: "KVALITA", value: "4K rozlišení" },
      { icon: Clock, label: "PROVOZ", value: "24/7 nepřetržitě" },
    ],
    description:
      "Časosběrné kamery zachytí celou stavbu — od výkopu po kolaudaci. Denně aktualizované záběry přímo v portálu.",
    cta: "Více o časosběrech",
    video: asset("/videos/portal/casosbery.mp4"),
  },
  {
    id: "drony",
    label: "Dronové služby",
    title: "DRONOVÉ SLUŽBY",
    icon: Video,
    metrics: [
      { icon: Video, label: "KVALITA", value: "4K video a foto" },
      { icon: CheckCircle, label: "LICENCE", value: "Certifikovaný provoz" },
    ],
    description:
      "Letecké záběry staveb a areálů. Kinematograficky zpracované výstupy pro marketing i technickou dokumentaci.",
    cta: "Více o dronech",
    video: asset("/videos/portal/dronove-sluzby.mp4"),
  },
  {
    id: "obsah",
    label: "Obsah a sítě",
    title: "OBSAH A SÍTĚ",
    icon: Share2,
    metrics: [
      { icon: Share2, label: "PLATFORMY", value: "IG + LinkedIn + FB" },
      { icon: PenTool, label: "SLUŽBY", value: "Copy, grafika, publikace" },
    ],
    description:
      "Kompletní správa sociálních sítí. Tvorba obsahu z vašich realizací a pravidelné publikování s měřitelnou performance.",
    cta: "Více o obsahu",
    video: asset("/videos/portal/obsah-a-site.mp4"),
  },
  {
    id: "portal",
    label: "Klientský portál",
    title: "KLIENTSKÝ PORTÁL",
    icon: LayoutDashboard,
    metrics: [
      { icon: Cloud, label: "ŘEŠENÍ", value: "Cloudová platforma" },
      { icon: LayoutDashboard, label: "PŘÍSTUP", value: "Vše na jednom místě" },
    ],
    description:
      "Vlastní platforma Constructivy — schvalování příspěvků, reporty, stahování materiálů. Přehled v reálném čase.",
    cta: "Otevřít portál",
    video: asset("/videos/portal/klientsky-portal.mp4"),
  },
];

export function Section4PortalShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const mockupBlurRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const phaseCRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // ---- Desktop scroll choreography ----
  useEffect(() => {
    const section = sectionRef.current;
    const mockup = mockupRef.current;
    const blur = mockupBlurRef.current;
    const phaseC = phaseCRef.current;
    const hint = scrollHintRef.current;
    if (!section || !mockup || !blur || !phaseC) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      // Výchozí stav: mockup 1×, bez blur; blur vrstva a fáze C skryté.
      gsap.set(mockup, { scale: 1, filter: "blur(0px)", opacity: 1 });
      gsap.set(blur, { opacity: 0 });
      gsap.set(phaseC, { opacity: 0, pointerEvents: "none" });
      if (hint) gsap.set(hint, { opacity: 1 });

      // Jediný ScrollTrigger — používáme timeline s jednou 0-1 časovou osou,
      // kde klíčové události dávám na konkrétní "position" hodnoty.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;

            // Scroll hint fade out během prvních 10 %
            if (hint) {
              hint.style.opacity = p < 0.1 ? String(1 - p / 0.1) : "0";
            }

            // Scroll-spy ve fázi C (55 → 100 %), rozdělí do 6 sub-fází.
            if (p >= 0.55) {
              const cp = (p - 0.55) / 0.45; // 0-1 v rámci fáze C
              const idx = Math.min(
                Math.floor(cp * SERVICES.length),
                SERVICES.length - 1,
              );
              setActiveIndex((prev) => (prev !== idx ? idx : prev));
            } else {
              setActiveIndex(0);
            }
          },
        },
      });

      // Fáze B: zoom + blur na mockupu (15 – 55 %)
      tl.fromTo(
        mockup,
        { scale: 1, filter: "blur(0px)" },
        { scale: 4.5, filter: "blur(6px)", ease: "none", duration: 0.4 },
        0.15,
      );

      // Crossfade mockup → mockup-bg-blur (40 – 55 %)
      tl.to(blur, { opacity: 1, ease: "none", duration: 0.15 }, 0.4);

      // Fáze C fade-in (45 – 55 %)
      tl.to(
        phaseC,
        { opacity: 1, pointerEvents: "auto", ease: "none", duration: 0.1 },
        0.45,
      );

      // Mockup se v 55 % úplně schová — blur vrstva drží pozadí fáze C
      tl.to(mockup, { opacity: 0, ease: "none", duration: 0.01 }, 0.55);
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="section-4"
      aria-label="Klientský portál — showcase"
      className="relative h-[500vh] bg-black"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Vrstva 1 — mockup (zoomuje + blur se škáluje) */}
        <div
          ref={mockupRef}
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${asset("/images/portal/mockup.png")})`,
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
            transformOrigin: "24% 50%",
            willChange: "transform, filter, opacity",
          }}
        />

        {/* Vrstva 2 — rozostřené staveniště (pozadí fáze C) */}
        <div
          ref={mockupBlurRef}
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${asset("/images/portal/mockup-bg-blur.png")})`,
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
            opacity: 0,
            willChange: "opacity",
          }}
        />

        {/* Scroll hint */}
        <div
          ref={scrollHintRef}
          aria-hidden="true"
          className="absolute bottom-10 left-1/2 z-20 -translate-x-1/2 flex items-center gap-2 text-white text-sm"
          style={{ textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}
        >
          Scroll ↓
        </div>

        {/* Fáze C — 3-column pinned layout */}
        <div
          ref={phaseCRef}
          className="phase-c absolute inset-0 z-10 hidden md:flex items-center justify-center gap-6 px-8"
          style={{ opacity: 0 }}
        >
          <VideoCard services={SERVICES} activeIndex={activeIndex} />
          <SidebarNav activeIndex={activeIndex} />
          <InfoCard services={SERVICES} activeIndex={activeIndex} />
        </div>

        {/* Mobile fallback — 6 sekcí pod sebou (desktop layout je md:flex) */}
        <div className="md:hidden absolute inset-0 overflow-y-auto bg-black">
          <MobileStack services={SERVICES} />
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// Levá karta — video s crossfade mezi službami
// ═══════════════════════════════════════════════════════════
function VideoCard({
  services,
  activeIndex,
}: {
  services: Service[];
  activeIndex: number;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl"
      style={{ width: "32vw", height: "62vh" }}
    >
      {services.map((s, i) => (
        <video
          key={s.id}
          src={s.video}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
          style={{ opacity: i === activeIndex ? 1 : 0 }}
          aria-hidden={i === activeIndex ? undefined : "true"}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Střední sidebar — logo + label + 6 položek se scroll-spy
// ═══════════════════════════════════════════════════════════
function SidebarNav({ activeIndex }: { activeIndex: number }) {
  return (
    <nav
      aria-label="Služby portálu"
      className="relative flex flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl"
      style={{ width: "300px", height: "62vh" }}
    >
      {/* Header — logo + label */}
      <div className="flex items-center gap-3 border-b border-white/15 px-5 py-4">
        <Image
          src="/images/logo.svg"
          alt="Constructiva"
          width={32}
          height={32}
          className="h-8 w-8 object-contain"
        />
        <div className="flex flex-col leading-tight">
          <span className="text-[11px] font-semibold tracking-[0.2em] text-white">
            CONSTRUCTIVA
          </span>
          <span className="text-[10px] tracking-[0.18em] text-white/60">
            KLIENTSKÝ PORTÁL
          </span>
        </div>
      </div>

      {/* 6 položek */}
      <ul className="flex flex-1 flex-col gap-1 p-3">
        {SERVICES.map((s, i) => {
          const Icon = s.icon;
          const active = i === activeIndex;
          return (
            <li key={s.id}>
              <div
                aria-current={active ? "true" : undefined}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-200"
                style={{
                  background: active
                    ? "rgba(168, 197, 214, 0.20)"
                    : "transparent",
                  color: active ? "#ffffff" : "rgba(255,255,255,0.6)",
                  fontWeight: active ? 500 : 400,
                }}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span>{s.label}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════
// Pravá karta — info o aktivní službě (crossfade)
// ═══════════════════════════════════════════════════════════
function InfoCard({
  services,
  activeIndex,
}: {
  services: Service[];
  activeIndex: number;
}) {
  return (
    <div
      className="relative rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl"
      style={{ width: "26vw", minHeight: "52vh" }}
    >
      {services.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 flex flex-col justify-between p-8 transition-opacity duration-300"
          style={{ opacity: i === activeIndex ? 1 : 0 }}
          aria-hidden={i === activeIndex ? undefined : "true"}
        >
          <div className="flex flex-col gap-6">
            <h3
              className="font-manrope font-bold text-white"
              style={{
                fontSize: "clamp(2rem, 3.5vw, 3rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
              }}
            >
              {s.title}
            </h3>

            <div className="flex flex-col gap-4">
              {s.metrics.map((m, j) => {
                const Icon = m.icon;
                return (
                  <div key={j} className="flex items-start gap-3">
                    <Icon className="h-4 w-4 mt-0.5 flex-shrink-0 text-white/70" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] tracking-[0.18em] text-white/70">
                        {m.label}
                      </span>
                      <span className="text-base text-white">{m.value}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-sm leading-relaxed text-white/70">
              {s.description}
            </p>
          </div>

          <a
            href="#"
            className="inline-flex items-center gap-2 self-end text-lg text-white hover:underline"
          >
            {s.cta}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Mobile verze — 6 sekcí pod sebou, normální scroll, bez pin
// ═══════════════════════════════════════════════════════════
function MobileStack({ services }: { services: Service[] }) {
  return (
    <div className="flex flex-col gap-8 px-4 py-10">
      {services.map((s) => {
        const Icon = s.icon;
        return (
          <article
            key={s.id}
            className="flex flex-col gap-4 rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-md"
          >
            <header className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-white" />
              <h3 className="font-manrope text-xl font-semibold text-white">
                {s.label}
              </h3>
            </header>
            <div className="aspect-video overflow-hidden rounded-xl">
              <video
                src={s.video}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-2">
              {s.metrics.map((m, j) => {
                const MIcon = m.icon;
                return (
                  <div key={j} className="flex items-center gap-2">
                    <MIcon className="h-3.5 w-3.5 text-white/60" />
                    <span className="text-[10px] tracking-widest text-white/60">
                      {m.label}
                    </span>
                    <span className="text-sm text-white">{m.value}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-sm leading-relaxed text-white/70">
              {s.description}
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-1 text-sm text-white hover:underline"
            >
              {s.cta}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </article>
        );
      })}
    </div>
  );
}
