"use client";

// Sekce 4 · Portal Showcase — pinned scroll-spy
//
// Žádný 3D průlet, žádný laptop. Rovnou finální layout ze 3 sloupců:
//   VLEVO   — video aktivní služby (crossfade)
//   STŘED   — sidebar "Klientský portál" se 6 položkami
//   VPRAVO  — info karta aktivní služby (crossfade)
//
// Sekce je vysoká 6 × ITEM_VH a uvnitř sticky h-screen. Jak se scrolluje,
// ScrollTrigger přepíná aktivní index → proskakuje se položkami.
// Položky jsou zároveň klikatelné — klik odscrolluje na střed daného pásma,
// takže scroll-spy zůstane v synchru.

import { useCallback, useEffect, useRef, useState } from "react";
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
import { useLenis } from "../providers/LenisProvider";

gsap.registerPlugin(ScrollTrigger);

// Výška sekce = 6 položek × 70vh = 420vh (viz md:h-[420vh] níže).

type Metric = { icon: LucideIcon; label: string; value: string };

type Service = {
  id: string;
  label: string;
  title: string;
  icon: LucideIcon;
  metrics: [Metric, Metric];
  description: string;
  cta: string;
  href: string;
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
    href: "#section-8",
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
    href: "#section-8",
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
    href: "#section-8",
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
    href: "#section-8",
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
    href: "#section-8",
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
    href: "https://portal.constructiva.cz",
    video: asset("/videos/portal/klientsky-portal.mp4"),
  },
];

export function Section4PortalShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const lenis = useLenis();

  // ── Scroll-spy + entry animace ──────────────────────────────
  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      // Jemný nájezd trojice karet, než se sekce zapíchne.
      gsap.fromTo(
        stage,
        { opacity: 0, y: 48 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            once: true,
          },
        },
      );

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const idx = Math.min(
            Math.floor(self.progress * SERVICES.length),
            SERVICES.length - 1,
          );
          setActiveIndex((prev) => (prev === idx ? prev : idx));
        },
      });
    });

    return () => {
      mm.revert();
    };
  }, []);

  // ── PERF: hraje jen video aktivní služby, a jen když je sekce vidět ──
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const videos = Array.from(
      section.querySelectorAll<HTMLVideoElement>("video[data-index]"),
    );

    let visible = false;

    const sync = () => {
      videos.forEach((v) => {
        const isActive = Number(v.dataset.index) === activeIndex;
        if (visible && isActive) v.play().catch(() => {});
        else v.pause();
      });
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { rootMargin: "300px" },
    );
    io.observe(section);
    sync();

    return () => io.disconnect();
  }, [activeIndex]);

  // ── Klik na položku → odscrolluj na střed jejího pásma ──────
  const goTo = useCallback(
    (i: number) => {
      const section = sectionRef.current;
      if (!section) return;

      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const scrollable = section.offsetHeight - window.innerHeight;

      // Mobil (bez pinu) — sekce není delší než viewport, jen přepni index.
      if (scrollable <= 0) {
        setActiveIndex(i);
        return;
      }

      const target =
        sectionTop + ((i + 0.5) / SERVICES.length) * scrollable;

      setActiveIndex(i);

      if (lenis) lenis.scrollTo(target, { duration: 0.8 });
      else window.scrollTo({ top: target, behavior: "smooth" });
    },
    [lenis],
  );

  return (
    <section
      ref={sectionRef}
      id="section-4"
      aria-label="Klientský portál — co pro vás děláme"
      className="relative bg-white md:h-[420vh]"
    >
      {/* ════════ Desktop — pinned 3 sloupce ════════ */}
      <div className="hidden md:flex md:sticky md:top-0 md:h-screen md:w-full md:items-center md:justify-center md:overflow-hidden">
        <div
          ref={stageRef}
          className="flex w-full items-stretch justify-center gap-8 px-8 lg:gap-12 xl:gap-16"
          style={{ willChange: "transform, opacity" }}
        >
          <VideoCard activeIndex={activeIndex} />
          <SidebarNav activeIndex={activeIndex} onSelect={goTo} />
          <InfoCard activeIndex={activeIndex} />
        </div>
      </div>

      {/* ════════ Mobile — stack karet ════════ */}
      <div className="md:hidden">
        <MobileStack />
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// Levá karta — video s crossfade
// ═══════════════════════════════════════════════════════════
function VideoCard({ activeIndex }: { activeIndex: number }) {
  return (
    <div
      className="relative flex-shrink-0 overflow-hidden rounded-2xl bg-[#E8F0F7] shadow-[0_24px_60px_-20px_rgba(21,42,62,0.28)]"
      style={{ width: "min(30vw, 620px)", height: "min(64vh, 700px)" }}
    >
      {SERVICES.map((s, i) => (
        <video
          key={s.id}
          data-index={i}
          src={s.video}
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
          style={{ opacity: i === activeIndex ? 1 : 0 }}
          aria-hidden={i === activeIndex ? undefined : "true"}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Střední sidebar — klikatelné položky + scroll-spy
// ═══════════════════════════════════════════════════════════
function SidebarNav({
  activeIndex,
  onSelect,
}: {
  activeIndex: number;
  onSelect: (i: number) => void;
}) {
  return (
    <nav
      aria-label="Služby portálu"
      className="flex flex-shrink-0 flex-col self-center rounded-2xl bg-white shadow-[0_24px_60px_-24px_rgba(21,42,62,0.22)]"
      style={{ width: "320px", padding: "28px" }}
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

      <ul className="flex flex-col gap-1">
        {SERVICES.map((s, i) => {
          const Icon = s.icon;
          const active = i === activeIndex;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-current={active ? "true" : undefined}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors duration-200 hover:bg-[#F2F6FA]"
                style={{
                  background: active ? "#E8F0F7" : "transparent",
                  color: active ? "#152A3E" : "#9AA5B1",
                  fontWeight: active ? 500 : 400,
                }}
              >
                <Icon
                  className="h-4 w-4 flex-shrink-0"
                  strokeWidth={active ? 2.25 : 1.75}
                  aria-hidden="true"
                />
                <span>{s.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Progress — kolikátá položka z šesti */}
      <div
        aria-hidden="true"
        className="mt-6 flex items-center gap-3 px-3"
      >
        <div className="h-px flex-1 bg-[#E5EAF0]">
          <div
            className="h-px bg-[#152A3E] transition-all duration-300"
            style={{
              width: `${((activeIndex + 1) / SERVICES.length) * 100}%`,
            }}
          />
        </div>
        <span className="text-[10px] tabular-nums tracking-[0.18em] text-[#9AA5B1]">
          {String(activeIndex + 1).padStart(2, "0")}/
          {String(SERVICES.length).padStart(2, "0")}
        </span>
      </div>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════
// Pravá karta — info o aktivní službě (crossfade)
// ═══════════════════════════════════════════════════════════
function InfoCard({ activeIndex }: { activeIndex: number }) {
  return (
    <div
      className="relative flex-shrink-0 self-center rounded-2xl bg-white shadow-[0_24px_60px_-24px_rgba(21,42,62,0.22)]"
      style={{ width: "min(28vw, 560px)", height: "min(56vh, 620px)" }}
    >
      {SERVICES.map((s, i) => {
        const active = i === activeIndex;
        const external = s.href.startsWith("http");
        return (
          <div
            key={s.id}
            className="absolute inset-0 flex flex-col justify-between p-10 transition-opacity duration-500"
            style={{
              opacity: active ? 1 : 0,
              pointerEvents: active ? "auto" : "none",
            }}
            aria-hidden={active ? undefined : "true"}
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
                      <Icon
                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#152A3E]"
                        aria-hidden="true"
                      />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] tracking-[0.18em] text-[#9AA5B1]">
                          {m.label}
                        </span>
                        <span className="text-sm text-[#152A3E]">
                          {m.value}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-sm leading-relaxed" style={{ color: "#5A6B7C" }}>
                {s.description}
              </p>
            </div>

            <a
              href={s.href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              tabIndex={active ? undefined : -1}
              className="group inline-flex items-center gap-2 self-end text-base font-medium text-[#152A3E] hover:underline"
            >
              {s.cta}
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </a>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Mobile verze — stack 6 karet pod sebou
// ═══════════════════════════════════════════════════════════
function MobileStack() {
  return (
    <div className="flex flex-col gap-8 bg-white px-4 py-14">
      <header className="flex items-center gap-3 px-1">
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
      </header>

      {SERVICES.map((s) => {
        const Icon = s.icon;
        const external = s.href.startsWith("http");
        return (
          <article
            key={s.id}
            className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-[0_18px_48px_-24px_rgba(21,42,62,0.28)]"
          >
            <header className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-[#152A3E]" aria-hidden="true" />
              <h3 className="font-manrope text-xl font-semibold text-[#152A3E]">
                {s.label}
              </h3>
            </header>
            <div className="aspect-video overflow-hidden rounded-xl bg-[#E8F0F7]">
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
                    <MIcon
                      className="h-3.5 w-3.5 text-[#9AA5B1]"
                      aria-hidden="true"
                    />
                    <span className="text-[10px] tracking-widest text-[#9AA5B1]">
                      {m.label}
                    </span>
                    <span className="text-sm text-[#152A3E]">{m.value}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "#5A6B7C" }}>
              {s.description}
            </p>
            <a
              href={s.href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
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
