import { useEffect, useState } from "react";

export function usePageVisible() {
  const [visible, setVisible] = useState(
    () => typeof document === "undefined" || document.visibilityState !== "hidden",
  );

  useEffect(() => {
    const sync = () => setVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("pagehide", sync);
    window.addEventListener("pageshow", sync);
    return () => {
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pagehide", sync);
      window.removeEventListener("pageshow", sync);
    };
  }, []);

  return visible;
}
