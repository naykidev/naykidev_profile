import { useEffect } from "react";
import { useAppStore } from "@/systems/store";

type LockableOrientation = ScreenOrientation & {
  lock?: (orientation: string) => Promise<void>;
};

/** Best-effort portrait lock. iOS Safari only honors this in installed PWAs. */
export function usePortraitLock() {
  const mode = useAppStore((s) => s.mode);

  useEffect(() => {
    if (mode === "traditional") return;
    const orientation = screen.orientation as LockableOrientation | undefined;
    if (!orientation?.lock) return;
    orientation.lock("portrait").catch(() => {});
    return () => {
      orientation.unlock?.();
    };
  }, [mode]);
}
