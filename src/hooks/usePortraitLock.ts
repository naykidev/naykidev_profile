import { useEffect } from "react";
import { useAppStore } from "@/systems/store";

type LockableOrientation = ScreenOrientation & {
  lock?: (orientation: string) => Promise<void>;
};

/**
 * Portrait lock only for the intro landing card.
 * Explore/tour keep rotation free so MobileControls landscape layouts can apply.
 * iOS Safari only honors orientation.lock in installed PWAs.
 */
export function usePortraitLock() {
  const mode = useAppStore((s) => s.mode);

  useEffect(() => {
    const orientation = screen.orientation as LockableOrientation | undefined;
    if (!orientation?.lock) return;
    if (mode !== "intro") {
      orientation.unlock?.();
      return;
    }
    orientation.lock("portrait").catch(() => {});
    return () => {
      orientation.unlock?.();
    };
  }, [mode]);
}
