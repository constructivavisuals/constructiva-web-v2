// Motion tokeny (SPEC 1.5) + sdílené konstanty pro synchronizaci animací
// mezi Loaderem a Hero.

// GSAP easing tokeny — pro konzistentní feel napříč sekcemi.
export const EASE = {
  smooth: "power2.inOut",      // default pro většinu transitions
  out: "power3.out",           // elementy vstupující do viewportu
  in: "power2.in",             // elementy opouštějící viewport
  bounce: "back.out(1.4)",     // CTA buttons, tile reveal
  expo: "expo.out",            // hero text reveal
} as const;

// Loader timeline: fill bar 2.2s + fade out 0.6s.
// Hero animace čekají na konec loaderu, aby naběhly viditelně.
export const LOADER_FILL_DURATION = 2.2;
export const LOADER_FADE_DURATION = 0.6;
export const LOADER_TOTAL_DURATION =
  LOADER_FILL_DURATION + LOADER_FADE_DURATION;
