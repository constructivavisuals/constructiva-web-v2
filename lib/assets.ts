// Asset helper (SPEC 3.3) — prefixne cestu base URL (R2 v prod, /assets v dev fallbacku).

const BASE = process.env.NEXT_PUBLIC_ASSETS_BASE_URL ?? "/assets";

export function asset(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${BASE}${normalized}`;
}
