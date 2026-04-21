# 🏗️ CONSTRUCTIVA WEB v2 — Kompletní technická specifikace

> **Cíl:** Postavit nový web `constructiva.cz` jako 1:1 replika scroll/animace feelu webu [toptier.relats.com](https://toptier.relats.com/), ale s Constructiva obsahem. Web prezentuje marketingovou agenturu pro stavebnictví.
>
> **Pro Claude Code:** Přečti si celý dokument, než začneš cokoli psát. Každá sekce má HTML strukturu, CSS/Tailwind classes, GSAP animace a přesný seznam asset cest. Pokud něco není jasné, **zeptej se uživatele, nevymýšlej si**.

---

## 📐 0. PROJEKT SETUP

### 0.1 Repository
- **Název:** `constructiva-web-v2`
- **Lokální cesta:** `~/constructiva-web-v2/`
- **Remote:** GitHub (Michal vytvoří nový repo)
- **Deploy:** Vercel (napojeno na `constructiva.cz` **až po** dokončení a odsouhlasení webu; dočasně běží na Vercel preview URL)

### 0.2 Tech Stack
```
Next.js         16 (App Router)
React           19
TypeScript      5.x
Tailwind CSS    4
GSAP            3.12+ (ScrollTrigger, SplitText plugin — oba free)
Lenis           1.x (smooth scroll)
Resend          pro kontaktní formulář
```

### 0.3 Struktura složek
```
constructiva-web-v2/
├── app/
│   ├── layout.tsx              # Root layout (Lenis provider, fonts, nav, metadata)
│   ├── page.tsx                # Homepage — renderuje všech 9 sekcí pod sebou
│   ├── globals.css             # Tailwind + CSS variables + global styles
│   ├── api/
│   │   └── contact/
│   │       └── route.ts        # POST endpoint pro formulář (Resend)
│   └── components/
│       ├── providers/
│       │   └── LenisProvider.tsx
│       ├── layout/
│       │   ├── Nav.tsx         # Sticky nav [Logo] ... [Klientský portál]
│       │   └── ContactModal.tsx # Popup formulář "Domluvte si schůzku"
│       └── sections/
│           ├── Section0Loader.tsx
│           ├── Section1Hero.tsx
│           ├── Section2TileMosaic.tsx
│           ├── Section3BoschSequence.tsx
│           ├── Section4PortalShowcase.tsx
│           ├── Section5BigNumber.tsx
│           ├── Section6References.tsx
│           ├── Section7SkyGuard.tsx
│           └── Section8Footer.tsx
├── public/
│   ├── fonts/                  # Lokální fonty pokud neberem z Google
│   ├── images/                 # Fotky (odkazy na R2 CDN v kódu)
│   ├── videos/                 # Videa (odkazy na R2 CDN v kódu)
│   └── favicon.ico
├── lib/
│   ├── resend.ts               # Resend client
│   └── assets.ts               # R2 URL helper (env-driven)
├── .env.local                  # Secrets (R2, Resend)
├── .env.example                # Template
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

### 0.4 package.json dependencies
```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "gsap": "^3.12.5",
    "lenis": "^1.1.20",
    "resend": "^4.0.0",
    "lucide-react": "^0.469.0",
    "clsx": "^2.1.1"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "@types/node": "^22.10.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^16.0.0"
  }
}
```

### 0.5 .env.example
```bash
# Resend (pro kontaktní formulář)
RESEND_API_KEY=re_xxxxx
CONTACT_EMAIL=info@constructiva.cz

# Cloudflare R2 (pro assety — videa, fotky)
# Assety se neuploadují přes kód — nahrají se manuálně nebo přes wrangler.
# Kód jen odkazuje na veřejné R2 URL.
NEXT_PUBLIC_ASSETS_BASE_URL=https://assets.constructiva.cz
# Fallback pro vývoj bez R2: NEXT_PUBLIC_ASSETS_BASE_URL=/assets
```

> 📌 **Asset strategy:** Michal bude mít assety lokálně v `~/constructiva-web-v2/assets-source/` (pro pořádek). Do `public/` je kopírovat **nebude** — Claude Code vytvoří skript nebo návod jak je pushnout na Cloudflare R2 (bucket `constructiva-web-assets`, custom doména `assets.constructiva.cz`). V kódu se používá helper `asset('/videos/hero/showreel.mp4')` který prefixne base URL. **Fallback pro vývoj:** pokud R2 není nastaveno, helper použije `/assets` (tj. `public/assets/`).

---

## 🎨 1. DESIGN SYSTEM

### 1.1 Barvy (CSS custom properties)
Tyto barvy vychází z grafického manuálu Constructiva:

```css
:root {
  /* Brand */
  --color-primary:   #A8C5D6;  /* světle modrá — accent, aktivní stavy */
  --color-secondary: #152A3E;  /* tmavě modrá — hlavní brand, dark sections */
  --color-tertiary:  #8A9BAE;  /* šedá — sekundární text */
  --color-neutral:   #0D1F2D;  /* velmi tmavá — nejtmavší background */

  /* Utility */
  --color-white:     #FFFFFF;
  --color-offwhite:  #F5F7FA;  /* pro light sections */
  --color-text:      #152A3E;  /* default text color on light bg */
  --color-text-muted:#8A9BAE;
  --color-border:    #E5EAF0;

  /* Accent pro "aktuální projekt" indikátor (zachované z původního webu) */
  --color-live:      #10B981;  /* zelená tečka */
}
```

### 1.2 Fonty
- **Headlines:** `Manrope` (Google Fonts) — weights: 300, 400, 500, 600, 700, 800
- **Body:** `Inter` (Google Fonts) — weights: 400, 500, 600
- **Fallback:** `-apple-system, BlinkMacSystemFont, sans-serif`

Načtení přes `next/font/google` v `app/layout.tsx`:
```tsx
import { Manrope, Inter } from 'next/font/google';

const manrope = Manrope({ subsets: ['latin', 'latin-ext'], variable: '--font-manrope', display: 'swap' });
const inter = Inter({ subsets: ['latin', 'latin-ext'], variable: '--font-inter', display: 'swap' });
```

### 1.3 Tailwind config (přidat do `tailwind.config.ts`)
```ts
export default {
  theme: {
    extend: {
      colors: {
        primary:   'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        tertiary:  'var(--color-tertiary)',
        neutral:   'var(--color-neutral)',
        offwhite:  'var(--color-offwhite)',
        live:      'var(--color-live)',
      },
      fontFamily: {
        manrope: ['var(--font-manrope)', 'sans-serif'],
        inter:   ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
};
```

### 1.4 Typografie (typescale)
| Token | Size | Line-height | Use case |
|---|---|---|---|
| `text-hero` | `clamp(3rem, 10vw, 9rem)` | `0.95` | Hero headline, Big Number |
| `text-display` | `clamp(2.5rem, 6vw, 5rem)` | `1.05` | Sekční nadpisy |
| `text-h1` | `clamp(2rem, 4vw, 3.5rem)` | `1.1` | Reference, Sky Guard headline |
| `text-h2` | `clamp(1.5rem, 3vw, 2.5rem)` | `1.2` | Střední nadpisy |
| `text-body` | `clamp(1rem, 1.2vw, 1.125rem)` | `1.6` | Body text |
| `text-label` | `0.75rem` | `1.4` | Malé labels, uppercase, letter-spacing: 0.15em |

### 1.5 Easing tokens (GSAP)
Tyto easingy jsou extraktované z Relats a fungují dobře pro scroll-driven animace:
```ts
// lib/motion.ts
export const EASE = {
  smooth: 'power2.inOut',           // default pro většinu transitions
  out: 'power3.out',                 // elementy vstupující do viewportu
  in: 'power2.in',                   // elementy opouštějící viewport
  bounce: 'back.out(1.4)',           // CTA buttons, tile reveal
  expo: 'expo.out',                  // hero text reveal
} as const;
```

### 1.6 Spacing (sekce)
- Každá sekce = `min-h-screen` (100vh), pokud není pinned; pinned sekce mají vlastní wrapper s vyšší výškou (viz sekce 3, 4).
- Padding: `px-6 md:px-12 lg:px-20` pro content containers.
- Nav height: `72px` (konstantní, sticky nad všemi sekcemi).

---

## 🧭 2. GLOBAL LAYOUT

### 2.1 `app/layout.tsx`
```tsx
import type { Metadata } from 'next';
import { Manrope, Inter } from 'next/font/google';
import { LenisProvider } from './components/providers/LenisProvider';
import { Nav } from './components/layout/Nav';
import './globals.css';

const manrope = Manrope({ subsets: ['latin', 'latin-ext'], variable: '--font-manrope', display: 'swap' });
const inter   = Inter({   subsets: ['latin', 'latin-ext'], variable: '--font-inter',   display: 'swap' });

export const metadata: Metadata = {
  title: 'Constructiva — Stavíme viditelnost vašich projektů',
  description: 'Marketingová agentura specializovaná na stavebnictví a development. Vizualizace, dokumentace, timelapse, drony, obsah a klientský portál.',
  openGraph: {
    title: 'Constructiva — Stavíme viditelnost vašich projektů',
    description: 'Marketingová agentura pro stavebnictví. Od vizualizace po hotový obsah.',
    url: 'https://constructiva.cz',
    siteName: 'Constructiva',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
    locale: 'cs_CZ',
    type: 'website',
  },
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" className={`${manrope.variable} ${inter.variable}`}>
      <body className="font-inter bg-offwhite text-secondary antialiased">
        <LenisProvider>
          <Nav />
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}
```

### 2.2 LenisProvider
```tsx
// app/components/providers/LenisProvider.tsx
'use client';
import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    // Napoj Lenis na GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    return () => { lenis.destroy(); };
  }, []);

  return <>{children}</>;
}
```

### 2.3 Nav (sticky, viditelný pořád)
```tsx
// app/components/layout/Nav.tsx
'use client';
import Link from 'next/link';
import Image from 'next/image';

export function Nav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[72px]
                       flex items-center justify-between px-6 md:px-12 lg:px-20
                       bg-white/60 backdrop-blur-md border-b border-white/20">
      <Link href="/" aria-label="Constructiva — domů" className="flex items-center gap-3">
        <Image
          src="/images/logo.svg"
          alt="Constructiva"
          width={120}
          height={32}
          priority
        />
      </Link>
      <Link
        href="https://portal.constructiva.cz"
        target="_blank"
        rel="noopener noreferrer"
        className="px-5 py-2.5 rounded-full bg-secondary text-white
                   text-sm font-medium tracking-wide
                   hover:bg-secondary/90 transition-colors"
      >
        Klientský portál
      </Link>
    </header>
  );
}
```

### 2.4 Homepage composition (`app/page.tsx`)
```tsx
import { Section0Loader } from './components/sections/Section0Loader';
import { Section1Hero } from './components/sections/Section1Hero';
import { Section2TileMosaic } from './components/sections/Section2TileMosaic';
import { Section3BoschSequence } from './components/sections/Section3BoschSequence';
import { Section4PortalShowcase } from './components/sections/Section4PortalShowcase';
import { Section5BigNumber } from './components/sections/Section5BigNumber';
import { Section6References } from './components/sections/Section6References';
import { Section7SkyGuard } from './components/sections/Section7SkyGuard';
import { Section8Footer } from './components/sections/Section8Footer';

export default function HomePage() {
  return (
    <main>
      <Section0Loader />
      <Section1Hero />
      <Section2TileMosaic />
      <Section3BoschSequence />
      <Section4PortalShowcase />
      <Section5BigNumber />
      <Section6References />
      <Section7SkyGuard />
      <Section8Footer />
    </main>
  );
}
```

---

## 📦 3. ASSET MANAGEMENT

### 3.1 Lokální struktura (před uploadem na R2)
Michal si bude organizovat assety lokálně v `~/constructiva-web-v2/assets-source/`:
```
assets-source/
├── videos/
│   ├── hero/
│   │   └── showreel.mp4                      # Sekce 1
│   ├── tiles/
│   │   ├── 1.mp4 ... 7.mp4                    # Sekce 2
│   ├── portal/
│   │   ├── vizualizace.mp4
│   │   ├── dokumentace.mp4
│   │   ├── casosbery.mp4
│   │   ├── dronove-sluzby.mp4
│   │   ├── obsah-a-site.mp4
│   │   └── klientsky-portal.mp4               # Sekce 4 (levý blok videa)
│   └── skyguard/
│       └── skyguard.mp4                       # Sekce 7
├── images/
│   ├── logo.svg                               # Nav + loader
│   ├── hero/
│   │   └── poster.jpg                         # Fallback pro hero video
│   ├── bosch-sequence/
│   │   └── frame_0001.webp ... frame_0300.webp  # Sekce 3 (300 framů)
│   ├── portal/
│   │   ├── mockup.png                         # Fotka laptopu na staveništi
│   │   └── mockup-bg-blur.jpg                 # Rozostřené pozadí (staveniště)
│   ├── big-number/
│   │   └── bosch-hall.jpg                     # Sekce 5 (finální Bosch hala)
│   ├── references/
│   │   ├── 01-bosch-jihlava.jpg
│   │   ├── 02-nexen-zatec.jpg
│   │   ├── 03-kerous-zoomlion.jpg
│   │   ├── 04-bauhaus-trmice.jpg
│   │   ├── 05-fve-trutnov.jpg
│   │   └── 06-jipocar-halam.jpg               # Sekce 6
│   └── og-image.jpg                           # OpenGraph (1200×630)
└── README.md                                   # Přehled co kam patří
```

### 3.2 Upload na Cloudflare R2 — 2 cesty

#### Cesta A (doporučená) — Cloudflare R2 přes wrangler CLI
1. Michal si v Cloudflare dashboard vytvoří bucket `constructiva-web-assets` (nebo už má jako `constructiva-portal`).
2. Claude Code vygeneruje upload skript `scripts/upload-assets.mjs`, který nahraje celý `assets-source/` na R2.
3. Nastaví se custom doména `assets.constructiva.cz` → R2 public URL.
4. V `.env.local` bude `NEXT_PUBLIC_ASSETS_BASE_URL=https://assets.constructiva.cz`.
5. Kdykoliv Michal přidá/změní asset → spustí `npm run upload-assets`.

#### Cesta B (fallback pro vývoj) — lokální `public/assets/`
1. Michal prostě zkopíruje `assets-source/*` → `public/assets/*`.
2. V `.env.local` bude `NEXT_PUBLIC_ASSETS_BASE_URL=/assets`.
3. Funguje out-of-the-box, ale repo bude velké (videa).

> ⚠️ **Claude Code:** Preferuj **Cestu A**. Vygeneruj `scripts/upload-assets.mjs` (uses `@aws-sdk/client-s3` protože R2 má S3-compatible API), dokumentuj v README.md.

### 3.3 Asset helper (`lib/assets.ts`)
```ts
const BASE = process.env.NEXT_PUBLIC_ASSETS_BASE_URL ?? '/assets';
export function asset(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${BASE}${normalized}`;
}
```

Použití:
```tsx
<video src={asset('/videos/hero/showreel.mp4')} />
```

---

## 🎬 SEKCE 0–8 — DETAILNÍ SPEC

# SEKCE 0 · Loader

**Co to je:** Intro obrazovka při načítání webu. Logo Constructiva + progress bar co najíždí zleva doprava.

### Layout
- `position: fixed; inset: 0; z-index: 100;`
- Background: `var(--color-secondary)` (tmavě modrá `#152A3E`)
- Flex column, centrováno obsahem

### Obsah (v tomto pořadí shora dolů, centrováno)
1. **Logo Constructiva** — SVG z `/images/logo.svg`, **světlá varianta** (vhodná pro dark bg), width `120px`
2. **Text "CONSTRUCTIVA"** — Manrope 500, uppercase, letter-spacing `0.3em`, font-size `20px`, barva `var(--color-primary)` (světle modrá)
3. **Progress bar** — pod logem, s mezerou `48px`
   - Container: `width: 240px; height: 2px; background: rgba(168, 197, 214, 0.2);`
   - Fill: `background: var(--color-primary); height: 100%; width: 0% → 100%;`

### Animace (GSAP)
```ts
// 1. Načti skutečný progress z browseru (preload assetů)
// 2. Tween width fill baru 0 → 100% podle skutečného progressu
// 3. Při 100% → fade out celý loader (0.6s, ease: 'power2.inOut')
// 4. Po fade out → unmount (display: none)

// Zjednodušená implementace (bez real preload):
useEffect(() => {
  const tl = gsap.timeline();
  tl.to(fillRef.current, { width: '100%', duration: 2.2, ease: 'power1.inOut' })
    .to(containerRef.current, { opacity: 0, duration: 0.6, ease: 'power2.inOut' })
    .set(containerRef.current, { display: 'none' });
}, []);
```

### Tech detaily
- Komponenta je **client-only** (`'use client'`)
- Při mountu zamkni scroll (`document.body.style.overflow = 'hidden'`), při unmount uvolni
- Klidně použij `Image` z next/image pro logo

---

# SEKCE 1 · Hero

**Co to je:** Fullscreen hero s videem showreelu na pozadí, velkým nadpisem uprostřed, CTA na scroll.

### Layout
- `height: 100vh; width: 100vw; position: relative; overflow: hidden;`
- Nav je nad ní (z-50), hero je z-10

### Vrstvy (odspodu nahoru)
1. **Video background** — `<video autoPlay muted loop playsInline poster={asset('/images/hero/poster.jpg')}>`
   - `src={asset('/videos/hero/showreel.mp4')}`
   - `className="absolute inset-0 w-full h-full object-cover"`
2. **Dark overlay** — `absolute inset-0 bg-black/30` (pro čitelnost textu)
3. **Content container** — centrované:
   - **Headline** (velký, bílý, Manrope 500):
     ```
     Stavíme viditelnost
     vašich projektů
     ```
     - `text-hero` (viz typescale)
     - `text-white`
     - `text-center max-w-5xl mx-auto`
     - line break mezi "viditelnost" a "vašich" (buď `<br />` nebo CSS)
   - **CTA tlačítko** pod nadpisem (mezera `48px`):
     - Text: **"Více o tom co děláme"**
     - Styl: glass pill — `bg-white/15 backdrop-blur-md border border-white/30 text-white px-6 py-3 rounded-full`
     - Ikona šipky dolů (z `lucide-react`: `<ArrowDown className="w-4 h-4" />`) vedle textu
     - On click: **smooth scroll** na `#section-2` (Lenis `scrollTo('#section-2')`)

### Animace (GSAP)
- Při mount/po loaderu:
  - Headline: fade + slide up z `y: 40, opacity: 0 → y: 0, opacity: 1`, duration `1.2s`, ease `power3.out`, delay `0.2s`
  - CTA: stejná animace, delay `0.5s`
- Na scroll: velmi jemný parallax na videu (`y: -100px` při 100vh scrollu), ale **JE TO VOLITELNÉ** — Relats to nemá, můžeme vynechat pro čistotu

### Důležité
- Video **musí být muted** (jinak autoplay nefunguje)
- Fallback poster.jpg pro pomalé sítě
- Mobilní optimalizace: použít menší video `showreel-mobile.mp4` pokud Michal dodá, jinak stejné video

---

# SEKCE 2 · Tile Mosaic (Intro sequence)

**Co to je:** Mozaika 7 video dlaždic + centrální dlaždice s nadpisem. Replikuje Relats "We cover all sustainable mobility solutions".

### Layout (desktop)
Grid 3 × 3 (nebo fluid), ale ne dokonale pravidelný — Relats má irregular mozaiku. Návrh:

```
┌─────────┬───────────────────────┬──────────┐
│ tile 1  │       tile 2          │ tile 3   │
│ (top-L) │       (top-C, wide)   │ (top-R)  │
├─────────┼───────────────────────┼──────────┤
│         │                       │          │
│ tile 4  │     ✦ CENTER TILE ✦  │ tile 5   │
│ (mid-L) │     (s nadpisem)      │ (mid-R)  │
│         │                       │          │
├─────────┴───────────────────────┴──────────┤
│            tile 6      │      tile 7       │
│           (bot-L)      │     (bot-R)       │
└────────────────────────┴───────────────────┘
```

Implementace v CSS Grid:
```css
.mosaic {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-rows: 1fr 1.5fr 1fr;
  grid-template-areas:
    "t1 t2 t3"
    "t4 center t5"
    "t6 t7 t7";
  gap: 8px;
  width: 100vw;
  height: 100vh;
}
```

### Obsah dlaždic
- **Každá dlaždice** = `<video autoPlay muted loop playsInline>` s vlastním zdrojem:
  - Tile 1 → `/videos/tiles/1.mp4`
  - Tile 2 → `/videos/tiles/2.mp4`
  - ... Tile 7 → `/videos/tiles/7.mp4`
- **Center tile** (velká uprostřed):
  - Také video nebo statický image (Michal rozhodne podle toho co pošle — zatím předpokládej že je to **jeden z 7 videí** nebo **showreel.mp4 re-use**)
  - Přes video je **text overlay**:
    ```
    Váš partner v oblasti
    stavebního marketingu
    ```
    - `text-display`, Manrope 500, bílá, centrováno, `text-shadow: 0 2px 20px rgba(0,0,0,0.4)` pro čitelnost

### Scroll animace (GSAP ScrollTrigger) — KLÍČOVÁ ČÁST
Replikuje Relats feel: při vstupu do sekce se dlaždice "složí" z okrajů dovnitř do mozaiky.

```ts
useEffect(() => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: sectionRef.current,
      start: 'top bottom',    // začne když top sekce je na bottom viewportu
      end: 'top top',          // skončí když top sekce je na top viewportu
      scrub: 1,                // plynulé (smooth scrub)
    },
  });

  // Počáteční stav: dlaždice "odlétnuté" do svých rohů/stran
  gsap.set('.tile-1', { x: '-100%', y: '-100%', opacity: 0 });
  gsap.set('.tile-2', { y: '-100%', opacity: 0 });
  gsap.set('.tile-3', { x: '100%', y: '-100%', opacity: 0 });
  gsap.set('.tile-4', { x: '-100%', opacity: 0 });
  gsap.set('.tile-5', { x: '100%', opacity: 0 });
  gsap.set('.tile-6', { x: '-100%', y: '100%', opacity: 0 });
  gsap.set('.tile-7', { x: '100%', y: '100%', opacity: 0 });
  gsap.set('.center-tile', { scale: 1.3, opacity: 0.8 });

  // Cílový stav: všechny na místě
  tl.to('.tile-1, .tile-2, .tile-3, .tile-4, .tile-5, .tile-6, .tile-7', {
    x: 0, y: 0, opacity: 1, duration: 1, ease: 'power2.out', stagger: 0.05,
  })
  .to('.center-tile', { scale: 1, opacity: 1, duration: 1, ease: 'power2.out' }, '-=0.8');
}, []);
```

### Důležité
- Videa musí být **malá** (každé < 2 MB, komprese H.264/H.265, max 1080p, 5–10s loop)
- Video loading: `preload="metadata"`, lazy (až ScrollTrigger matchuje)
- Nadpis v center tile má `pointer-events: none` (aby nerušil případný kliknutí)

---

# SEKCE 3 · Bosch Scroll Sequence

**Co to je:** Pinned sekce s canvas scroll-driven animací. 300 framů stavby Bosch Jihlava postupně odhaluje stavbu. Přes sekvenci jsou 3 nadpisy co crossfadují (Časosběry / Video / Fotografie) + CTA tlačítko dole.

### Layout
- Wrapper: `height: 400vh; position: relative;` (dlouhý scroll pro pinned content)
- Inside wrapper: **sticky container** s `height: 100vh` (pinned při scrollu)
- Uvnitř sticky:
  - `<canvas>` fullscreen (pozadí — sekvence)
  - Text overlay — absolutní pozice, centrovaný nadpis
  - CTA sticky dole — "Domluvte si s námi schůzku"

### Canvas scroll sequence (implementace)

```tsx
'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { asset } from '@/lib/assets';

const FRAMES_COUNT = 300;
const FRAMES_PATH = (i: number) =>
  asset(`/images/bosch-sequence/frame_${String(i).padStart(4, '0')}.webp`);

export function BoschScrollSequence() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef({ current: 0 });

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 1. Preload všech 300 framů
    const images: HTMLImageElement[] = [];
    for (let i = 1; i <= FRAMES_COUNT; i++) {
      const img = new Image();
      img.src = FRAMES_PATH(i);
      images.push(img);
    }

    // Draw first frame when ready
    images[0].onload = () => {
      ctx.drawImage(images[0], 0, 0, canvas.width, canvas.height);
    };

    const render = () => {
      const img = images[frameRef.current.current];
      if (img?.complete) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // cover behavior
        const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
        const w = img.width * scale, h = img.height * scale;
        const x = (canvas.width - w) / 2, y = (canvas.height - h) / 2;
        ctx.drawImage(img, x, y, w, h);
      }
    };

    // 2. Scroll-driven frame update
    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      pin: '.bosch-sticky',
      onUpdate: (self) => {
        const frameIndex = Math.floor(self.progress * (FRAMES_COUNT - 1));
        if (frameIndex !== frameRef.current.current) {
          frameRef.current.current = frameIndex;
          render();
        }
      },
    });

    // 3. Resize handler
    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      render();
    };
    window.addEventListener('resize', onResize);

    return () => {
      trigger.kill();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <section ref={containerRef} className="relative h-[400vh]">
      <div className="bosch-sticky sticky top-0 h-screen w-full overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Text overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <h2 className="phase-text text-hero text-white font-manrope font-medium text-center">
            Časosběry
          </h2>
          {/* Další 2 phase-text se přepínají crossfade — viz animace dole */}
        </div>

        {/* CTA bottom */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <button
            onClick={() => openContactModal()}
            className="px-8 py-4 rounded-full bg-white text-secondary font-medium
                       flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
          >
            <ArrowRight className="w-4 h-4" />
            Domluvte si s námi schůzku
          </button>
        </div>
      </div>
    </section>
  );
}
```

### Text crossfade (3 fáze)
Mám 3 `<h2>` texty ("Časosběry", "Video", "Fotografie") stacknuté přes sebe s `position: absolute`. Přepínají se podle scroll progress:
- 0 – 0.33 → "Časosběry" opacity 1, ostatní 0
- 0.33 – 0.66 → "Video" opacity 1
- 0.66 – 1.0 → "Fotografie" opacity 1

Implementace:
```ts
// Uvnitř onUpdate ScrollTriggeru:
const p = self.progress;
gsap.to('.phase-casosbery', { opacity: p < 0.33 ? 1 : 0, duration: 0.3 });
gsap.to('.phase-video',     { opacity: p >= 0.33 && p < 0.66 ? 1 : 0, duration: 0.3 });
gsap.to('.phase-fotografie',{ opacity: p >= 0.66 ? 1 : 0, duration: 0.3 });
```

### CTA Modal — viz Sekce 8.3 pro spec kontaktního modalu (sdílený s footerem)

### Příprava framů (instrukce pro Michala)
Zdrojové fotky Bosch (časosběr) → 300 framů WebP:
```bash
# Pokud má timelapse video:
ffmpeg -i timelapse.mp4 -vf "select='eq(n\,floor((total_frames/300)*n))',scale=1920:-1:flags=lanczos" \
  -vsync vfr -q:v 80 frames/frame_%04d.webp

# Pokud má sekvenci fotek (např. 1500 kusů), vybrat každou 5. a přejmenovat:
# (napíšu dedikovaný skript v scripts/prepare-frames.mjs)
```

> 🛠️ **Claude Code task:** Vytvoř skript `scripts/prepare-frames.mjs` který vezme složku s JPG fotkami (libovolný počet) a vytvoří přesně 300 WebP framů rovnoměrně rozložených + komprimovaných (sharp/imagemin).

---

# SEKCE 4 · Portál Showcase

**Co to je:** Nejsložitější sekce. Začne fullscreen fotkou laptopu na staveništi → scrollem se kamera "zoomuje dovnitř obrazovky" → zůstane pinned 3-column layout: LEVÝ blok (video + nadpis aktivní položky) / STŘEDNÍ sidebar (6 položek, aktivní se mění scroll-spy) / PRAVÝ blok (nadpis + popis aktivní položky). Pozadí = rozostřené staveniště.

### Layout — 3 fáze scrollu

Wrapper má `height: 700vh` (dost místa: 1× entry, 1× zoom, 6× pinned showcase × ~1vh each ~= 6vh).

#### Fáze A (0 – 15% = `0vh – 105vh`): Entry photo
- Sticky obsahuje **fullscreen fotku** `portal/mockup.png` (laptop na staveništi)
- Nic jiného

#### Fáze B (15 – 30% = `105vh – 210vh`): Zoom into screen
- Fotka se **zoomuje** pomocí CSS `transform: scale()` a `translate()`, zaměřuje se na obrazovku laptopu
- Zároveň se **rozostřuje** okolí (staveniště, jeřáby) — `filter: blur(0 → 20px)` na zbytek
- Po skončení: obrazovka laptopu pokrývá viewport

```ts
gsap.to('.mockup-bg', {
  scale: 4,
  x: '20%',   // upravit podle kompozice fotky; cíl = centrovaný laptop
  y: '-15%',
  filter: 'blur(20px)',
  ease: 'none',
  scrollTrigger: { trigger, start: '15% top', end: '30% top', scrub: 1 },
});
```

#### Fáze C (30 – 100% = `210vh – 700vh`): Pinned showcase
- Na pozadí: **rozostřená staveniště fotka** (`mockup-bg-blur.jpg` — Michal vytvoří z mockup.png s vyříznutým laptopem)
- 3-column layout fade-in:
  - **Levý blok** (30% width): padding top/bottom, content centered vertically
    - **Nadpis** (velký, Manrope 500, bílý): dynamický podle aktivní položky
    - **Video** (pod nadpisem, aspect-ratio 16:9, rounded-lg): dynamické podle aktivní položky
  - **Střední sidebar** (400px fixed width, centered horizontally):
    - 1:1 replika designu z `constructiva-sidebar.html` (Michal poslal)
    - Logo `C` + "CONSTRUCTIVA" + "KLIENTSKÝ PORTÁL"
    - 6 položek: Vizualizace / Dokumentace / Časosběry / Dronové služby / Obsah a sítě / Klientský portál
    - Aktivní = světlé pozadí `var(--color-primary)/15`, tmavší text; neaktivní = muted
  - **Pravý blok** (30% width): stejná struktura jako levý
    - **Nadpis** (duplicitně, pro balancovaný look)
    - **Popis** pod nadpisem (placeholder)

### Scroll-spy pro aktivní položku

Sidebar má 6 položek. Každá aktivní v intervalu:
- 0 – 16.66% pinned fáze → Vizualizace
- 16.66 – 33.33% → Dokumentace
- 33.33 – 50% → Časosběry
- 50 – 66.66% → Dronové služby
- 66.66 – 83.33% → Obsah a sítě
- 83.33 – 100% → Klientský portál

```ts
const ITEMS = ['vizualizace', 'dokumentace', 'casosbery', 'drony', 'obsah', 'portal'];

ScrollTrigger.create({
  trigger: pinnedSectionRef.current,
  start: 'top top',
  end: 'bottom bottom',
  scrub: 0.5,
  pin: '.portal-sticky',
  onUpdate: (self) => {
    // self.progress je pro celý wrapper (0 to 1)
    // Ale pinned fáze začíná až od 30% => normalizuj:
    const pinnedStart = 30 / 100;  // dle celého wrapperu
    const rawP = self.progress;
    if (rawP < pinnedStart) return;
    const p = (rawP - pinnedStart) / (1 - pinnedStart);  // 0-1 v pinned fázi
    const idx = Math.min(Math.floor(p * ITEMS.length), ITEMS.length - 1);
    setActiveIndex(idx);
  },
});
```

### Content data
```ts
const PORTAL_ITEMS = [
  {
    id: 'vizualizace',
    label: 'Vizualizace',
    icon: LayersIcon,
    videoSrc: asset('/videos/portal/vizualizace.mp4'),
    title: 'Vizualizace',
    description: 'Fotorealistické 3D vizuály z architektonických plánů, ještě před položením prvního základního kamene. Pro investory, úřady i klienty.',
  },
  {
    id: 'dokumentace',
    label: 'Dokumentace',
    icon: CameraIcon,
    videoSrc: asset('/videos/portal/dokumentace.mp4'),
    title: 'Dokumentace',
    description: 'Pravidelné návštěvy staveniště s profesionálním týmem fotografů a kameramanů. Zachytíme každý milník.',
  },
  {
    id: 'casosbery',
    label: 'Časosběry',
    icon: ClockIcon,
    videoSrc: asset('/videos/portal/casosbery.mp4'),
    title: 'Časosběry',
    description: 'Autonomní 4K kamery zachycující stavbu kontinuálně i několik let, v jakémkoli počasí.',
  },
  {
    id: 'drony',
    label: 'Dronové služby',
    icon: DroneIcon,
    videoSrc: asset('/videos/portal/dronove-sluzby.mp4'),
    title: 'Dronové služby',
    description: 'Certifikovaní piloti s nejnovějšími drony. Ptačí perspektiva, drone-mapping i termovize.',
  },
  {
    id: 'obsah',
    label: 'Obsah a sítě',
    icon: ShareIcon,
    videoSrc: asset('/videos/portal/obsah-a-site.mp4'),
    title: 'Obsah a sítě',
    description: 'Personalizované příspěvky, copywriting a kompletní správa sociálních sítí. Instagram, LinkedIn, Facebook.',
  },
  {
    id: 'portal',
    label: 'Klientský portál',
    icon: GridIcon,
    videoSrc: asset('/videos/portal/klientsky-portal.mp4'),
    title: 'Klientský portál',
    description: 'Vše na jednom místě. Cloudové řešení pro schvalování, tracking a přístup ke všem materiálům.',
  },
];
```

> ⚠️ **Popisky jsou placeholder** — Michal je upřesní později. Claude Code použije tyto jako výchozí.

### Crossfade obsahu
Když se změní `activeIndex`:
- Nadpis (levý + pravý): fade out current → fade in new (GSAP, 0.3s opacity)
- Video (levý): stejný fade + změna `src` (nebo 6 video elementů stacknutých a přepínání opacity)
- Popis (pravý): stejný fade

---

# SEKCE 5 · Big Number Reveal

**Co to je:** Fullscreen "wow" sekce. Velké číslo "1 000 000" přes fotku Bosch haly. Replikuje Relats "1,000,000 meters of sleeving".

### Layout
- `h-screen w-full relative overflow-hidden`
- Background: `asset('/images/big-number/bosch-hall.jpg')` jako `<img>` nebo `bg-image`
- Dark overlay: `bg-black/40`
- Content centered:
  ```
       Přes
  [ 1 000 000 ]   ← hero size, bílé, Manrope 600
  nasnímaných fotografií
  ```

### Animace
1. **Parallax** pozadí: `y: 0 → -100px` během scrollu (GSAP ScrollTrigger scrub)
2. **Counter animace** čísla: `0 → 1 000 000` při entry do viewportu (trigger `start: 'top 80%'`)
3. **Fade-up** textu (delay stagger): "Přes" → "1 000 000" → "nasnímaných fotografií"

```ts
// Counter
const obj = { val: 0 };
gsap.to(obj, {
  val: 1_000_000,
  duration: 2.5,
  ease: 'power2.out',
  scrollTrigger: { trigger: numberRef.current, start: 'top 75%' },
  onUpdate: () => {
    numberRef.current.textContent = Math.floor(obj.val).toLocaleString('cs-CZ');
  },
});
```

`toLocaleString('cs-CZ')` generuje `1 000 000` (mezery jako oddělovače tisíců v češtině).

---

# SEKCE 6 · Reference (Projekty)

**Co to je:** Horizontal/scroll-driven showcase 6 projektů. Levý panel = velký nadpis + menší nadpisy stacknuté, pravý panel = fotka + glass card s popisem. Replikuje Relats "Other Industries".

### Layout
```
┌──────────────────────────────────┬──────────────────────────────────┐
│   [REFERENCE]                    │                                   │
│                                  │      [fotka projektu]             │
│   ~Projekt 1~  (fade)            │                                   │
│   PROJEKT 2    (active, velký)   │                                   │
│   ~Projekt 3~  (fade)            │        ┌─────────────────┐        │
│   ~Projekt 4~  (fade)            │        │ 🏗️              │        │
│                                  │        │ Popis projektu │        │
│   ───────────────────            │        └─────────────────┘        │
│   [taby: B·J·N·Z·K·ZL·B·T·F·T·J·H] │                                   │
└──────────────────────────────────┴──────────────────────────────────┘
```

- Wrapper: `h-[600vh] relative` (100vh × 6 projektů)
- Sticky inner: `h-screen` sticky pinned
- Background: tmavě modrá `var(--color-neutral)` (#0D1F2D)

### Content data
```ts
const REFERENCES = [
  {
    id: 'bosch-jihlava',
    label: 'BOSCH JIHLAVA',
    title: 'Bosch Jihlava',
    image: asset('/images/references/01-bosch-jihlava.jpg'),
    icon: BuildingIcon,  // z lucide-react
    description: 'Placeholder popis projektu Bosch Jihlava.',
  },
  {
    id: 'nexen-zatec',
    label: 'NEXEN TIRE ŽATEC',
    title: 'Nexen Tire Žatec',
    image: asset('/images/references/02-nexen-zatec.jpg'),
    icon: BuildingIcon,
    description: 'Placeholder popis projektu Nexen Tire Žatec.',
  },
  {
    id: 'kerous-zoomlion',
    label: 'KEROUŠ × ZOOMLION',
    title: 'Kerouš × Zoomlion',
    image: asset('/images/references/03-kerous-zoomlion.jpg'),
    icon: BuildingIcon,
    description: 'Placeholder popis projektu Kerouš × Zoomlion.',
  },
  {
    id: 'bauhaus-trmice',
    label: 'BAUHAUS TRMICE',
    title: 'Bauhaus Trmice',
    image: asset('/images/references/04-bauhaus-trmice.jpg'),
    icon: BuildingIcon,
    description: 'Placeholder popis projektu Bauhaus Trmice.',
  },
  {
    id: 'fve-trutnov',
    label: 'FVE TRUTNOV',
    title: 'FVE Trutnov',
    image: asset('/images/references/05-fve-trutnov.jpg'),
    icon: SunIcon,  // FVE = solární
    description: 'Placeholder popis projektu FVE Trutnov.',
  },
  {
    id: 'jipocar-halam',
    label: 'JIPOCAR HALA M',
    title: 'Jipocar Hala M',
    image: asset('/images/references/06-jipocar-halam.jpg'),
    icon: BuildingIcon,
    description: 'Placeholder popis projektu Jipocar Hala M.',
  },
];
```

### Scroll-spy + animace
Stejný pattern jako Sekce 4:
- 6 "fází" (každá 16.66% pinned scrollu)
- Aktivní projekt:
  - Levý panel: jeho název jako velký nadpis (`text-display`, bold, barva textu), ostatní = malé, muted `var(--color-tertiary)`, menší font
  - Pravý panel: jeho fotka vidí (ostatní faded out), glass card dole s ikonou + popisem
- Crossfade 0.4s mezi stavy

### Taby dole (v levém panelu)
Řada 6 labels horizontálně, aktivní má underline + bold:
```tsx
<div className="flex gap-6 mt-auto flex-wrap">
  {REFERENCES.map((ref, i) => (
    <button
      key={ref.id}
      onClick={() => scrollToIndex(i)}  // volitelné, plynulý skok
      className={clsx(
        'text-xs tracking-widest transition-all',
        activeIndex === i
          ? 'text-secondary font-semibold border-b-2 border-secondary pb-1'
          : 'text-tertiary hover:text-secondary'
      )}
    >
      {ref.label}
    </button>
  ))}
</div>
```

### Glass card (vpravo dole na fotce)
```tsx
<div className="absolute bottom-8 right-8 max-w-sm
                bg-white/10 backdrop-blur-md border border-white/20
                rounded-2xl p-6 text-white">
  <ref.icon className="w-6 h-6 mb-3 text-primary" />
  <p className="text-sm leading-relaxed">{ref.description}</p>
</div>
```

---

# SEKCE 7 · Sky Guard

**Co to je:** Split layout 50/50. Vlevo video (Sky Guard), vpravo bílý panel s nadpisem a CTA. Replikuje Relats "Sustainability Commitment".

### Layout
- `h-screen w-full flex` (horizontální split, každý 50%)
- Levá polovina:
  - `relative overflow-hidden rounded-3xl` (border-radius pro visual break)
  - `<video autoPlay muted loop playsInline src={asset('/videos/skyguard/skyguard.mp4')}>`
- Pravá polovina:
  - `bg-white flex flex-col justify-center px-16 py-20`
  - Obsah:
    - **Headline** (Manrope 600, `text-h1`, tmavě modrá): "Vytěžte vaše projekty na maximum"
    - **Popis** (Inter 400, `text-body`, muted): "S naší dceřinou společností Sky Guard získáte profesionální dronové služby, termovizi a drone-mapping, které vašim projektům dodají nový rozměr."
    - **CTA**: odkaz na `https://www.sky-guard.cz` (target="_blank"), styl outlined pill:
      ```tsx
      <a href="https://www.sky-guard.cz" target="_blank" rel="noopener noreferrer"
         className="inline-flex items-center gap-2 px-6 py-3 rounded-full
                    border border-secondary text-secondary text-sm font-medium
                    hover:bg-secondary hover:text-white transition-colors">
        Sky Guard
        <ArrowUpRight className="w-4 h-4" />
      </a>
      ```

### Animace
Minimální, statická sekce. Jen fade-in obsahu (trigger `start: 'top 70%'`):
- Nadpis: fade-up 0.8s
- Popis: fade-up 0.8s, delay 0.15s
- CTA: fade-up 0.8s, delay 0.3s

### Responsive
Na mobilu: `flex-col` místo `flex-row`. Video na 50vh, text pod ním.

---

# SEKCE 8 · Footer CTA

**Co to je:** Velká sekce s wow nadpisem "Těšíme se na spolupráci!", CTA tlačítka, pod tím minimalistický footer s kontakty. Replikuje Relats "Join the ride" + footer.

### Layout

```
┌─────────────────────────────────────────────┐
│                                             │
│      [decentní Constructiva logo v BG]       │
│                                             │
│    ✦ Těšíme se na spolupráci! ✦             │
│                                             │
│    [Domluvte si schůzku]  →Napište nám      │
│                                             │
│  ─────────────────────────────────────      │
│                                             │
│  [Logo]     info@   | +420 | @  in f        │
│  © 2026 CONSTRUCTIVA                         │
└─────────────────────────────────────────────┘
```

- `h-screen relative bg-neutral text-white overflow-hidden`
- Main content center (headline + CTA) cca 85% height
- Footer bar (logo + kontakty) 15% height, bottom

### Hero content
- **Velké logo Constructiva v pozadí** — `absolute`, `opacity: 0.05`, centrované, width `80vw` (decentní vodoznak)
- **Headline**: **"Těšíme se na spolupráci!"** — `text-hero`, Manrope 700, bílá
  - Word-by-word reveal animace: každé slovo fade-up stagger 0.15s (Relats má slovo po slovu "Join the ride")
- **Řada tlačítek pod nadpisem** (flex row, gap 6):
  1. **"Domluvte si schůzku"** (primary): bílé pozadí, tmavý text, rounded pill, hover scale
     - On click: otevře **ContactModal** (viz 8.3)
  2. **"Napište nám"** (secondary): text-only s šipkou →, bílý text, hover primary color
     - On click: `mailto:info@constructiva.cz`

### Footer bar (dole)
```tsx
<div className="absolute bottom-0 left-0 right-0
                flex items-center justify-between px-6 md:px-12 lg:px-20 py-6
                border-t border-white/10">
  <div className="flex items-center gap-4">
    <Image src="/images/logo.svg" alt="Constructiva" width={100} height={26} />
  </div>
  <div className="flex items-center gap-6 text-sm text-white/70">
    <a href="mailto:info@constructiva.cz" className="hover:text-white transition">info@constructiva.cz</a>
    <span className="opacity-40">|</span>
    <a href="tel:+420737373430" className="hover:text-white transition">+420 737 373 430</a>
    <span className="opacity-40">|</span>
    <div className="flex gap-3">
      <a href="https://instagram.com/constructiva.cz" target="_blank" aria-label="Instagram"><InstagramIcon className="w-4 h-4" /></a>
      <a href="https://linkedin.com/company/constructiva" target="_blank" aria-label="LinkedIn"><LinkedinIcon className="w-4 h-4" /></a>
      <a href="https://facebook.com/constructiva.cz" target="_blank" aria-label="Facebook"><FacebookIcon className="w-4 h-4" /></a>
    </div>
  </div>
  <div className="text-xs text-white/50 tracking-widest">© 2026 CONSTRUCTIVA</div>
</div>
```

### Scroll-to-top button
Fixed pravý dolní roh (nad footer), malý kruh s šipkou nahoru. Lenis `scrollTo(0)` on click.
```tsx
<button
  onClick={() => lenis.scrollTo(0)}
  className="fixed bottom-8 right-8 w-12 h-12 rounded-full
             bg-primary text-secondary flex items-center justify-center
             hover:scale-110 transition-transform z-40"
  aria-label="Zpět nahoru"
>
  <ArrowUp className="w-5 h-5" />
</button>
```

---

## 📧 MODAL: ContactModal (sdílený)

**Použit v:** Sekce 3 (CTA), Sekce 8 (CTA primary)

### Spec
- Fullscreen overlay s backdrop blur
- Centered panel, white bg, rounded, max-width `720px`, padding `48px`
- Close button ✕ v pravém horním rohu
- **Split layout** uvnitř (na desktopu):
  - **Vlevo:** headline + kratký popis
  - **Vpravo:** form fields

### Obsah
```
[left]                          [right]
Domluvte si schůzku             [Jméno a příjmení *]
Řekněte nám o vašem             [Název firmy *]
projektu. Ozveme se do          [Email *]
24 hodin.                       [Telefon *]
                                [O jakém projektu uvažujete?]
                                [☐] Souhlasím se zpracováním
                                                      osobních údajů
                                [ Odeslat poptávku → ]
```

### Form fields
```tsx
const [formData, setFormData] = useState({
  name: '', company: '', email: '', phone: '', message: '', gdpr: false
});
const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
```

### Submit (API call)
```tsx
async function onSubmit() {
  setStatus('sending');
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (!res.ok) throw new Error('Failed');
    setStatus('success');
  } catch {
    setStatus('error');
  }
}
```

### API route `app/api/contact/route.ts`
```ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, company, email, phone, message, gdpr } = data;

    if (!gdpr) return NextResponse.json({ error: 'GDPR required' }, { status: 400 });
    if (!name || !email) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    await resend.emails.send({
      from: 'Constructiva Web <noreply@constructiva.cz>',
      to: process.env.CONTACT_EMAIL!,
      replyTo: email,
      subject: `Nová poptávka: ${name} (${company})`,
      html: `
        <h2>Nová poptávka z webu Constructiva</h2>
        <p><strong>Jméno:</strong> ${name}</p>
        <p><strong>Firma:</strong> ${company}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefon:</strong> ${phone}</p>
        <p><strong>Zpráva:</strong></p>
        <p>${message || '—'}</p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
```

### Success/Error states
- **Sending**: loader spinner v tlačítku, tlačítko disabled
- **Success**: formulář zmizí, místo něj ✓ ikona + "Díky, ozveme se do 24 hodin."
- **Error**: červená hláška pod tlačítkem "Něco se pokazilo, zkuste to prosím znovu nebo nám napište na info@constructiva.cz"

---

## 📱 MOBILNÍ OPTIMALIZACE

### Globální pravidla
- Breakpointy: `sm: 640px, md: 768px, lg: 1024px, xl: 1280px`
- Na mobilu < 768px:
  - Všechny `text-hero` → `text-5xl` (cca 3rem)
  - Pinned scroll sekce: **nechej** pinned, ale zkrať výšku wrapperu (např. `h-[400vh]` místo `h-[700vh]`)
  - Bosch sequence: použij menší verze WebP framů (1080px wide místo 1920px)

### Specifické úpravy
- **Sekce 2 (Mosaic)**: na mobilu místo 3×3 gridu → **vertical stack** (7 dlaždic pod sebou, centrální text přes prostřední)
- **Sekce 4 (Portal)**: na mobilu → **single column**, sidebar vyskočí nad content, levý/pravý blok pod sebou
- **Sekce 6 (References)**: na mobilu **bez pinnednu** — tradiční scroll, každý projekt jako samostatná karta fullscreen
- **Sekce 7 (Sky Guard)**: `flex-col` místo `flex-row` (video na 50vh, text pod)

### Video perf
- Preload `metadata` only
- Lazy load (ScrollTrigger `start: 'top bottom'` → `video.load()`)
- Poster image pro fallback

---

## 🚀 DEPLOY

### Vercel
1. Connect GitHub repo `constructiva-web-v2`
2. Framework preset: **Next.js**
3. Environment variables (Vercel dashboard):
   ```
   RESEND_API_KEY=re_xxxxx
   CONTACT_EMAIL=info@constructiva.cz
   NEXT_PUBLIC_ASSETS_BASE_URL=https://assets.constructiva.cz
   ```
4. Build settings: default (Vercel auto-detects Next.js 16)
5. **Doména**: zatím **NENAPOJOVAT** na `constructiva.cz`. Ponechat default Vercel preview URL pro testování. Finální přepnutí až po odsouhlasení.

### Cloudflare R2 setup
1. Dashboard → R2 → Create bucket `constructiva-web-assets` (public access)
2. Custom domain: `assets.constructiva.cz` → R2 bucket
3. Upload `assets-source/*` přes wrangler:
   ```bash
   npx wrangler r2 object put constructiva-web-assets/videos/hero/showreel.mp4 \
     --file assets-source/videos/hero/showreel.mp4
   ```
   (Claude Code vygeneruje bulk skript)

---

## ✅ TODO — co musí Michal doplnit

### Assety (povinné před spuštěním)
- [ ] `logo.svg` (Constructiva logo, SVG, light varianta)
- [ ] `showreel.mp4` (Sekce 1, hero video, ideálně 1080p, 20-40s)
- [ ] `hero/poster.jpg` (první frame hero videa)
- [ ] `tiles/1.mp4` – `tiles/7.mp4` (Sekce 2, 7 videí projektů, 5-10s loop)
- [ ] Bosch časosběr (zdrojové fotky nebo video) → vygenerovat 300 WebP framů
- [ ] `portal/mockup.png` (Sekce 4, laptop na staveništi — mockup)
- [ ] `portal/mockup-bg-blur.jpg` (stejný záběr bez laptopu, rozostřený)
- [ ] `portal/vizualizace.mp4` + 5 dalších videí (Sekce 4, 6 videí po položkách)
- [ ] `big-number/bosch-hall.jpg` (Sekce 5, finální Bosch hala z drone)
- [ ] `references/01-bosch-jihlava.jpg` – `06-jipocar-halam.jpg` (Sekce 6, 6 fotek)
- [ ] `skyguard/skyguard.mp4` (Sekce 7, Sky Guard promo video)
- [ ] `og-image.jpg` (1200×630, pro FB/LinkedIn share)

### Copy (doplní později)
- [ ] **Sekce 3**: CTA modal popis (momentálně generický, může se doladit)
- [ ] **Sekce 4**: 6 popisů pro portál (momentálně placeholder, Michal doladí)
- [ ] **Sekce 6**: 6 popisů pro reference cards (momentálně placeholder)
- [ ] **Sekce 7**: finální popis pod nadpisem "Vytěžte vaše projekty na maximum" (momentálně draft)

### Deployment
- [ ] Vytvořit GitHub repo `constructiva-web-v2`
- [ ] Vytvořit Cloudflare R2 bucket + custom doména
- [ ] Získat Resend API key
- [ ] Ověřit doménu `constructiva.cz` v Resend (pro `from: noreply@constructiva.cz`)

---

## 🎯 PRVNÍ CLAUDE CODE PROMPT

Zkopíruj toto do Claude Code v novém sessionu v `~/constructiva-web-v2/` (prázdná složka):

```
Ahoj! Stavíme nový web pro marketingovou agenturu Constructiva — 1:1 replika feelu [toptier.relats.com] s Constructiva obsahem.

V této složce najdeš soubor `SPEC.md` — to je kompletní technická specifikace. Přečti si ji celou, než začneš cokoli psát. Obsahuje všechno: tech stack, design system, 9 sekcí, assety, deploy.

Úkol #1 — Setup projektu:

1. Vytvoř Next.js 16 projekt (TypeScript, Tailwind 4, App Router, src-dir NE, alias @/*)
2. Nainstaluj dependencies: gsap, lenis, resend, lucide-react, clsx, @aws-sdk/client-s3
3. Nastav fonts v layout.tsx (Manrope + Inter z next/font/google)
4. Vytvoř globals.css s CSS proměnnými pro barvy (dle SPEC.md sekce 1.1)
5. Vytvoř strukturu složek dle SPEC.md sekce 0.3
6. Vytvoř LenisProvider (SPEC.md 2.2), Nav (SPEC.md 2.3)
7. Vytvoř kostru všech 9 sekčních komponent (jen placeholder "Sekce X" uvnitř, empty state)
8. Vytvoř page.tsx co je všechny renderuje pod sebou (SPEC.md 2.4)
9. Vytvoř asset helper lib/assets.ts (SPEC.md 3.3)
10. Vytvoř .env.example (SPEC.md 0.5)

Běž postupně, po každém kroku mi napiš co jsi udělal. Když něco není jasné ze SPEC.md, zeptej se mě — nevymýšlej si. Čeština v komentářích OK.

Začni.
```

### Další prompty (po dokončení setupu)

Postupně, jedna sekce za session:

```
Úkol #2 — Sekce 0 (Loader) + Sekce 1 (Hero):
Naimplementuj dle SPEC.md. Assety ještě nemám, použij placeholder URLs (např. https://placehold.co/1920x1080 pro poster, ukázkové video z Vercel example). Animace musí být přesně dle SPEC.md.
```

```
Úkol #3 — Sekce 2 (Tile Mosaic):
Naimplementuj dle SPEC.md. 7 dlaždic videí + centrální text. GSAP ScrollTrigger animace musí 1:1 replikovat Relats intro-tile-sequence — ověř na https://toptier.relats.com/ kolem druhé sekce.
```

```
Úkol #4 — Sekce 3 (Bosch Scroll Sequence):
Naimplementuj canvas scroll-driven frame sequence dle SPEC.md. Framů je 300, každý cca 80-150 KB WebP. Preload všech. Kresleni v requestAnimationFrame. Také vytvoř scripts/prepare-frames.mjs pro generování framů ze zdrojových fotek (sharp knihovna).
```

```
Úkol #5 — Sekce 4 (Portal Showcase) — NEJSLOŽITĚJŠÍ:
Naimplementuj 3-fázovou scroll animaci dle SPEC.md. Fáze A (entry photo), Fáze B (zoom do obrazovky), Fáze C (pinned 3-column showcase s 6 položkami scroll-spy). Sidebar design 1:1 dle constructiva-sidebar.html co je v tomto repu. Pokud něco z layoutu není jasné, zeptej se před implementací.
```

```
Úkol #6 — Sekce 5, 6, 7:
Naimplementuj postupně Big Number Reveal, References, Sky Guard dle SPEC.md.
```

```
Úkol #7 — Sekce 8 + ContactModal + API route:
Naimplementuj footer CTA, sdílený ContactModal (použitý v Sekci 3 a 8), a /api/contact route.ts s Resend integrací.
```

```
Úkol #8 — Mobilní optimalizace + polish:
Projdi všechny sekce a doplň responsive varianty dle SPEC.md sekce "Mobilní optimalizace". Otestuj na Chrome DevTools (iPhone 14, iPad).
```

```
Úkol #9 — Asset upload skript + deploy instrukce:
Vytvoř scripts/upload-assets.mjs (R2 bulk upload přes @aws-sdk/client-s3). Napiš README.md s instrukcemi pro Michala: jak nahrát assety, jak deploynout na Vercel.
```

---

## 📝 ZÁVĚR

Tento dokument je **zdroj pravdy** pro celý web. Claude Code by se ho měl držet, a když něco není jasné → **zeptat se uživatele**, ne vymýšlet.

Pořadí práce:
1. Setup projektu
2. Sekce 0–8 postupně
3. ContactModal + API
4. Mobile polish
5. R2 upload + deploy

Odhad času: **4–6 Claude Code sessions** × 30-60 min (podle plynulosti).

**Pro Michala:** Jakmile je setup hotový, spusť `npm run dev` a můžeš web vidět lokálně (s placeholderem místo assetů). Assety dodávej postupně do `assets-source/` a nahraj na R2.

**Hodně štěstí 🚀**

— Claude
