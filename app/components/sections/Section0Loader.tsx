"use client";

// Sekce 0 · Loader (SPEC Sekce 0)
// Intro overlay při načítání. Fixed top, logo + progress bar 0→100%, pak fade out.
// Scroll je zamčený, dokud loader běží.

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { useLenis } from "../providers/LenisProvider";
import {
  LOADER_FILL_DURATION,
  LOADER_FADE_DURATION,
} from "@/lib/motion";

export function Section0Loader() {
  const containerRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const [isActive, setIsActive] = useState(true);

  // Scroll lock — dokud je loader aktivní, žádný scroll (ani wheel, ani touch).
  useEffect(() => {
    if (!isActive) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isActive]);

  // Lenis stop/start — napojí se, jakmile je instance k dispozici.
  useEffect(() => {
    if (!isActive || !lenis) return;
    lenis.stop();
    return () => {
      lenis.start();
    };
  }, [isActive, lenis]);

  // GSAP timeline (běží jen jednou, na mount).
  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => setIsActive(false),
    });

    tl.to(fillRef.current, {
      width: "100%",
      duration: LOADER_FILL_DURATION,
      ease: "power1.inOut",
    }).to(
      containerRef.current,
      {
        opacity: 0,
        duration: LOADER_FADE_DURATION,
        ease: "power2.inOut",
      },
    );

    return () => {
      tl.kill();
    };
  }, []);

  if (!isActive) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-secondary"
      role="status"
      aria-label="Načítání stránky"
      aria-live="polite"
    >
      {/* Logo — SVG, bílá varianta přes CSS filter invert (zachovává alpha) */}
      <Image
        src="/images/logo.svg"
        alt="Constructiva"
        width={180}
        height={48}
        priority
        style={{
          filter: "invert(1)",
          marginBottom: "24px",
        }}
      />

      {/* Název v brand stylu pod logem */}
      <div
        className="font-manrope font-medium uppercase"
        style={{
          color: "var(--color-primary)",
          fontSize: "20px",
          letterSpacing: "0.3em",
        }}
      >
        Constructiva
      </div>

      {/* Progress bar — 240px wide, 2px tall */}
      <div
        className="mt-12"
        style={{
          width: "240px",
          height: "2px",
          background: "rgba(168, 197, 214, 0.2)",
        }}
      >
        <div
          ref={fillRef}
          className="h-full"
          style={{ width: 0, background: "var(--color-primary)" }}
        />
      </div>
    </div>
  );
}
