/**
 * Intro beat 1 host: cinematic low-poly San Diego coast.
 * Preview: /?preview=sandiego
 */
import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { SanDiegoWorld } from "./sanDiego/World";

export function SanDiegoTilesCanvas({
  elapsed,
  fade = 1,
}: {
  elapsed: number;
  fade?: number;
}) {
  if (fade <= 0.01) return null;
  const lift = 1 - fade;
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[56] overflow-hidden"
      style={{
        opacity: fade,
        filter: `blur(${lift * 16}px) brightness(${1 + lift * 0.35}) saturate(${1 - lift * 0.25})`,
        transform: `scale(${1 + lift * 0.28})`,
      }}
    >
      <Canvas
        dpr={[1, 1.5]}
        shadows
        gl={{ antialias: true, stencil: false }}
        camera={{ fov: 50, near: 0.4, far: 280, position: [-20, 20, 16] }}
        style={{ width: "100%", height: "100%", display: "block", background: "#e4ddd0" }}
      >
        <SanDiegoWorld elapsed={elapsed} fade={fade} />
      </Canvas>
      <div
        className="absolute bottom-6 left-1/2 z-[56] -translate-x-1/2 font-ui text-[11px] tracking-[0.28em] text-ink/50 uppercase"
        style={{ opacity: Math.max(0, 1 - lift * 1.6) }}
      >
        San Diego
      </div>
    </div>
  );
}

export function SanDiegoPreview() {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let id = 0;
    const loop = (now: number) => {
      setElapsed(((now - start) / 1000) % 4.2);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, []);
  const fade = elapsed > 2.3 ? Math.max(0.15, 1 - (elapsed - 2.3) / 1.5) : 1;
  return (
    <>
      <SanDiegoTilesCanvas elapsed={elapsed} fade={fade} />
      <p className="pointer-events-none absolute bottom-6 left-6 z-[56] font-ui text-[10px] tracking-[0.18em] text-ink/70 uppercase">
        San Diego preview
      </p>
    </>
  );
}

export function isSanDiegoPreviewQuery() {
  try {
    return new URLSearchParams(window.location.search).get("preview") === "sandiego";
  } catch {
    return false;
  }
}
