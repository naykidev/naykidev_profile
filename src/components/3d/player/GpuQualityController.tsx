import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useRef } from "react";
import { useAppStore } from "@/systems/store";

const PROBE_FRAMES = 80;

/**
 * Phones start at 1x DPR / no shadows. After a short FPS probe, capable
 * devices step up to 1.5x and (if still healthy) shadows.
 */
export function GpuQualityController({ coarse }: { coarse: boolean }) {
  const reducedMotion = useAppStore((s) => s.reducedMotion);
  const setGpuShadows = useAppStore((s) => s.setGpuShadows);
  const { gl, size } = useThree();
  const frames = useRef(0);
  const fpsSum = useRef(0);
  const done = useRef(false);

  useLayoutEffect(() => {
    frames.current = 0;
    fpsSum.current = 0;
    done.current = false;
    if (reducedMotion) {
      gl.shadowMap.enabled = false;
      gl.setPixelRatio(1);
      setGpuShadows(false);
      return;
    }
    if (!coarse) {
      gl.shadowMap.enabled = true;
      gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      setGpuShadows(true);
      return;
    }
    gl.shadowMap.enabled = false;
    gl.setPixelRatio(1);
    setGpuShadows(false);
  }, [coarse, gl, reducedMotion, setGpuShadows]);

  useFrame((_, dt) => {
    if (done.current || reducedMotion || !coarse) return;
    if (useAppStore.getState().mode === "intro") return;
    if (dt > 0 && dt < 0.1) {
      fpsSum.current += 1 / dt;
      frames.current += 1;
    }
    if (frames.current < PROBE_FRAMES) return;
    done.current = true;
    const fps = fpsSum.current / frames.current;
    const cores = navigator.hardwareConcurrency || 4;
    if (fps >= 50 && cores >= 6) {
      gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      gl.setSize(size.width, size.height, false);
    }
    if (fps >= 55 && cores >= 8) {
      gl.shadowMap.enabled = true;
      setGpuShadows(true);
    }
  });

  return null;
}
