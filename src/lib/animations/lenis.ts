import type Lenis from "lenis";

let instance: Lenis | null = null;

export function setLenis(lenis: Lenis | null) {
  instance = lenis;
}

/** Null when the visitor prefers reduced motion. */
export function getLenis() {
  return instance;
}
