"use client";

// Sekce 4 · Portal Showcase — cinematic 3D flythrough (Relats-inspired)
//
// Scéna ve 3D prostoru (CSS `perspective: 2000px`), 3 vrstvy:
//   - BACK  (z: -800, scale 1.6) — mockup-bg-blur.png (staveniště)
//   - MID   (z:  0,   rotateX 8°, rotateY -4°) — mockup.png (laptop)
//   - FRONT (z: 400, opacity 0)   — HTML 3-column layout
//
// Timeline pinned, scrub 1, napříč ~500vh:
//   A (0-15 %)   : klidová scéna, hint "Scroll ↓"
//   B (15-70 %)  : kamerový průlet — laptop se rovná + zvětšuje
//                   (rotateX/Y → 0, scale → 3.5, z → 600),
//                   pozadí fade-out + mírný zoom
//   C přechod (70-80 %): laptop fade-out → HTML fade-in (z 400 → 0)
//   C hold (80-100 %): HTML drží, scroll-spy 6 služeb × ~3.3 %

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
  label: string;
  title: string;
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
  const sceneRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const laptopRef = useRef<HTMLDivElement>(null);
  const htmlLayerRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const bg = bgRef.current;
    const laptop = laptopRef.current;
    const htmlLayer = htmlLayerRef.current;
    const hint = hintRef.current;
    if (!section || !bg || !laptop || !htmlLayer) return;

    const mm = gsap.matchMedia();

    // Desktop — 3D cinematic flythrough
    mm.add("(min-width: 768px)", () => {
      // Výchozí stav (shoduje se s inline style — GSAP si ho synchronizuje).
      gsap.set(laptop, {
        rotationX: 8,
        rotationY: -4,
        scale: 1,
        z: 0,
        opacity: 1,
      });
      gsap.set(bg, { scale: 1.6, opacity: 1 });
      gsap.set(htmlLayer, { opacity: 0, z: 400 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;

            // Hint fade-out (15-20 %)
            if (hint) {
              if (p < 0.15) hint.style.opacity = "1";
              else if (p < 0.2) hint.style.opacity = String(1 - (p - 0.15) / 0.05);
              else hint.style.opacity = "0";
            }

            // Scroll-spy v C hold (80-100 %) → 6 služeb × 3.33 %
            if (p >= 0.8) {
              const sp = (p - 0.8) / 0.2;
              const idx = Math.min(
                Math.floor(sp * SERVICES.length),
                SERVICES.length - 1,
              );
              setActiveIndex((prev) => (prev !== idx ? idx : prev));
            } else {
              setActiveIndex((prev) => (prev !== 0 ? 0 : prev));
            }
          },
        },
      });

      // Fáze B (15-70 %) — kamerový průlet
      tl.to(
        laptop,
        {
          rotationX: 0,
          rotationY: 0,
          scale: 3.5,
          z: 600,
          ease: "none",
          duration: 0.55,
        },
        0.15,
      );
      tl.to(
        bg,
        {
          scale: 2.2,
          opacity: 0,
          ease: "none",
          duration: 0.55,
        },
        0.15,
      );

      // Fáze C přechod (70-80 %) — laptop mizí, HTML se objeví
      tl.to(
        laptop,
        { opacity: 0, ease: "none", duration: 0.1 },
        0.7,
      );
      tl.to(
        htmlLayer,
        { opacity: 1, z: 0, ease: "none", duration: 0.1 },
        0.7,
      );
    });

    // PERF: pause videí když je sekce mimo viewport.
    const videos = Array.from(
      section.querySelectorAll<HTMLVideoElement>("video"),
    );
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videos.forEach((v) => v.play().catch(() => {}));
        } else {
          videos.forEach((v) => v.pause());
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(section);

    return () => {
      mm.revert();
      io.disconnect();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="section-4"
      aria-label="Klientský portál — showcase"
      className="relative md:h-[500vh]"
    >
      {/* ════════ Desktop 3D scéna ════════ */}
      <div
        className="hidden md:block md:sticky md:top-0 md:h-screen md:w-full md:overflow-hidden bg-white"
        style={{ perspective: "2000px" }}
      >
        <div
          ref={sceneRef}
          className="absolute inset-0"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* BACK — staveniště */}
          <div
            ref={bgRef}
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${asset("/images/portal/mockup-bg-blur.png")})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              transform: "translateZ(-800px) scale(1.6)",
              willChange: "transform, opacity",
            }}
          />

          {/* MID — laptop */}
          <div
            ref={laptopRef}
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${asset("/images/portal/mockup.png")})`,
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              transform: "translateZ(0) rotateX(8deg) rotateY(-4deg) scale(1)",
              willChange: "transform, opacity",
            }}
          />

          {/* FRONT — HTML layout */}
          <div
            ref={htmlLayerRef}
            className="absolute inset-0 flex items-center justify-center"
            style={{
              opacity: 0,
              transform: "translateZ(400px)",
              willChange: "transform, opacity",
            }}
          >
            <SidebarAndCards
              services={SERVICES}
              activeIndex={activeIndex}
            />
          </div>
        </div>

        {/* Hint „Scroll ↓" */}
        <div
          ref={hintRef}
          aria-hidden="true"
          className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 text-sm"
          style={{ color: "rgba(21, 42, 62, 0.55)" }}
        >
          Scroll ↓
        </div>
      </div>

      {/* ════════ Mobile — statický mockup + stack ════════ */}
      <div className="md:hidden bg-white">
        <div
          className="aspect-video w-full bg-no-repeat bg-center"
          style={{
            backgroundImage: `url(${asset("/images/portal/mockup.png")})`,
            backgroundSize: "contain",
          }}
        />
        <MobileStack services={SERVICES} />
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// Desktop — 3-column layout uvnitř htmlLayerRef
// ═══════════════════════════════════════════════════════════
function SidebarAndCards({
  services,
  activeIndex,
}: {
  services: Service[];
  activeIndex: number;
}) {
  return (
    <div className="flex items-center justify-center gap-16 px-8">
      <VideoCard services={services} activeIndex={activeIndex} />
      <SidebarNav activeIndex={activeIndex} />
      <InfoCard services={services} activeIndex={activeIndex} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Levá karta — video s crossfade
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
      className="relative overflow-hidden rounded-2xl bg-white shadow-xl"
      style={{ width: "28vw", height: "60vh" }}
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
// Střední sidebar — bílý clean, active bg #E8F0F7
// ═══════════════════════════════════════════════════════════
function SidebarNav({ activeIndex }: { activeIndex: number }) {
  return (
    <nav
      aria-label="Služby portálu"
      className="flex flex-col rounded-2xl bg-white shadow-xl"
      style={{ width: "320px", padding: "32px" }}
    >
      {/* Header — logo + label */}
      <div className="flex items-center gap-3 pb-5">
        <Image
          src="/images/logo.svg"
          alt="Constructiva"
          width={36}
          height={36}
          className="h-9 w-9 object-contain"
        />
        <div className="flex flex-col leading-tight">
          <span className="text-[11px] font-semibold tracking-[0.2em] text-[#152A3E]">
            CONSTRUCTIVA
          </span>
          <span className="text-[10px] tracking-[0.18em] text-[#9AA5B1]">
            KLIENTSKÝ PORTÁL
          </span>
        </div>
      </div>

      {/* 6 položek */}
      <ul className="flex flex-col gap-1">
        {SERVICES.map((s, i) => {
          const Icon = s.icon;
          const active = i === activeIndex;
          return (
            <li key={s.id}>
              <div
                aria-current={active ? "true" : undefined}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-200"
                style={{
                  background: active ? "#E8F0F7" : "transparent",
                  color: active ? "#152A3E" : "#9AA5B1",
                  fontWeight: active ? 500 : 400,
                }}
              >
                <Icon
                  className="h-4 w-4 flex-shrink-0"
                  strokeWidth={active ? 2.25 : 1.75}
                />
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
      className="relative rounded-2xl bg-white shadow-xl"
      style={{ width: "26vw", minHeight: "50vh", maxHeight: "60vh" }}
    >
      {services.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 flex flex-col justify-between p-10 transition-opacity duration-300"
          style={{ opacity: i === activeIndex ? 1 : 0 }}
          aria-hidden={i === activeIndex ? undefined : "true"}
        >
          <div className="flex flex-col gap-6">
            <h3
              className="font-manrope font-bold"
              style={{
                color: "#152A3E",
                fontSize: "clamp(1.75rem, 2.6vw, 2.5rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
              }}
            >
              {s.title}
            </h3>

            <div className="flex flex-col gap-3">
              {s.metrics.map((m, j) => {
                const Icon = m.icon;
                return (
                  <div key={j} className="flex items-start gap-3">
                    <Icon className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#152A3E]" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] tracking-[0.18em] text-[#9AA5B1]">
                        {m.label}
                      </span>
                      <span className="text-sm text-[#152A3E]">{m.value}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <p
              className="text-sm leading-relaxed"
              style={{ color: "#5A6B7C" }}
            >
              {s.description}
            </p>
          </div>

          <a
            href="#"
            className="inline-flex items-center gap-2 self-end text-base font-medium text-[#152A3E] hover:underline"
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
// Mobile verze — stack 6 karet pod sebou
// ═══════════════════════════════════════════════════════════
function MobileStack({ services }: { services: Service[] }) {
  return (
    <div className="flex flex-col gap-8 px-4 py-10 bg-white">
      {services.map((s) => {
        const Icon = s.icon;
        return (
          <article
            key={s.id}
            className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-lg"
          >
            <header className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-[#152A3E]" />
              <h3 className="font-manrope text-xl font-semibold text-[#152A3E]">
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
                    <MIcon className="h-3.5 w-3.5 text-[#9AA5B1]" />
                    <span className="text-[10px] tracking-widest text-[#9AA5B1]">
                      {m.label}
                    </span>
                    <span className="text-sm text-[#152A3E]">{m.value}</span>
                  </div>
                );
              })}
            </div>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "#5A6B7C" }}
            >
              {s.description}
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-1 text-sm font-medium text-[#152A3E] hover:underline"
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
