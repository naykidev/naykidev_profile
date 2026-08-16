import { useEffect, useState } from "react";

export function useCoarsePointer() {
  const [coarse, setCoarse] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(pointer: coarse)").matches : false,
  );

  useEffect(() => {
    const media = window.matchMedia("(pointer: coarse)");
    const sync = () => setCoarse(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return coarse;
}

/** Stick/touch HUD: phones, coarse pointers, and landscape phone heights. */
export function useTouchUi() {
  const coarse = useCoarsePointer();
  const [compact, setCompact] = useState(
    () =>
      typeof window !== "undefined" &&
      (window.innerWidth < 768 || window.innerHeight < 540),
  );

  useEffect(() => {
    const sync = () =>
      setCompact(window.innerWidth < 768 || window.innerHeight < 540);
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  return coarse || compact;
}
