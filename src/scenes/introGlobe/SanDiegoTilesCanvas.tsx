/**
 * Intro beat 1 host: cinematic low-poly San Diego coast.
 * Preview: /?preview=sandiego
 */
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Canvas } from "@react-three/fiber";
import { subscribeIntroPlayback } from "@/hooks/useIntroSequence";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";
import { usePageVisible } from "@/hooks/usePageVisible";
import { SanDiegoWorld } from "./sanDiego/World";
import { COAST_CAMERA_START } from "./sanDiego/CameraRig";

const layerStyle: CSSProperties = {
  transform: "translateZ(0)",
  backfaceVisibility: "hidden",
};

function applyFade(el: HTMLElement | null, fade: number) {
  if (!el) return;
  el.style.opacity = String(fade);
}

export function SanDiegoTilesCanvas({
  elapsed,
  fade = 1,
}: {
  elapsed?: number;
  fade?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const followIntro = elapsed === undefined;
  const visible = usePageVisible();
  const coarse = useCoarsePointer();
  const liveRef = useRef(true);
  const [live, setLive] = useState(true);

  useEffect(() => {
    if (!followIntro) {
      applyFade(wrapRef.current, fade);
      return;
    }
    return subscribeIntroPlayback((sample) => {
      applyFade(wrapRef.current, sample.sdFade);
      const next = sample.sdFade > 0.06;
      if (next !== liveRef.current) {
        liveRef.current = next;
        setLive(next);
      }
    });
  }, [followIntro, fade]);

  if (!followIntro && fade <= 0.01) return null;

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none absolute inset-0 z-[56] overflow-hidden"
      style={{ ...layerStyle, opacity: followIntro ? 1 : fade }}
    >
      <Canvas
        dpr={[1, 1]}
        shadows={false}
        frameloop={visible && live ? "always" : "never"}
        gl={{
          antialias: !coarse,
          stencil: false,
          alpha: false,
          powerPreference: "high-performance",
        }}
        camera={{ fov: 50, near: 0.4, far: 520, position: [...COAST_CAMERA_START] }}
        style={{ width: "100%", height: "100%", display: "block", background: "#c5d8ec" }}
      >
        <SanDiegoWorld
          elapsed={elapsed ?? 0}
          fade={followIntro ? 1 : fade}
          followIntro={followIntro}
        />
      </Canvas>
      <div className="absolute bottom-6 left-1/2 z-[56] -translate-x-1/2 font-ui text-[11px] tracking-[0.28em] text-ink/50 uppercase">
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

export { isSanDiegoPreviewQuery } from "./previewQuery";
