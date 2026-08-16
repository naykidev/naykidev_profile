import { useEffect } from "react";
import { useAppStore } from "@/systems/store";

export function usePrefersReducedMotion() {
  const setReducedMotion = useAppStore((s) => s.setReducedMotion);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [setReducedMotion]);
}
