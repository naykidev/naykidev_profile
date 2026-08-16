import { useRef, useState } from "react";
import { tryInteract } from "@/systems/interaction";
import { useAppStore } from "@/systems/store";

export function MobileControls() {
  const mode = useAppStore((s) => s.mode);
  const nearby = useAppStore((s) => s.nearby);
  const activePanel = useAppStore((s) => s.activePanel);
  const galleryProjectId = useAppStore((s) => s.galleryProjectId);
  const cameraTransition = useAppStore((s) => s.cameraTransition);
  const setMove = useAppStore((s) => s.setMove);
  const origin = useRef<{ x: number; y: number } | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  if (mode !== "explore" || activePanel || galleryProjectId) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 [@media(pointer:fine)]:hidden">
      <div
        className="pointer-events-auto absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-[max(0.85rem,env(safe-area-inset-left))] flex h-28 w-28 items-center justify-center rounded-full border border-white/20 bg-black/30 touch-none backdrop-blur-[10px]"
        onPointerDown={(event) => {
          event.preventDefault();
          (event.target as HTMLElement).setPointerCapture(event.pointerId);
          origin.current = { x: event.clientX, y: event.clientY };
        }}
        onPointerMove={(event) => {
          if (!origin.current) return;
          const dx = (event.clientX - origin.current.x) / 42;
          const dy = (event.clientY - origin.current.y) / 42;
          const x = Math.max(-1, Math.min(1, dx));
          const z = Math.max(-1, Math.min(1, dy));
          setKnob({ x, y: z });
          setMove({ x, z });
        }}
        onPointerUp={() => {
          origin.current = null;
          setKnob({ x: 0, y: 0 });
          setMove({ x: 0, z: 0 });
        }}
        onPointerCancel={() => {
          origin.current = null;
          setKnob({ x: 0, y: 0 });
          setMove({ x: 0, z: 0 });
        }}
        aria-label="Move"
      >
        <div
          className="h-10 w-10 rounded-full border border-white/30 bg-white/35"
          style={{ transform: `translate(${knob.x * 24}px, ${knob.y * 24}px)` }}
        />
      </div>
      {nearby && !cameraTransition ? (
        <button
          type="button"
          className="pointer-events-auto absolute bottom-[max(7.75rem,calc(env(safe-area-inset-bottom)+6.5rem))] left-1/2 -translate-x-1/2 rounded-full border border-white/20 bg-black/45 px-5 py-3 font-ui text-[11px] tracking-[0.18em] text-paper uppercase backdrop-blur-[10px]"
          onClick={() => tryInteract()}
        >
          Open {nearby.name}
        </button>
      ) : (
        <p className="absolute bottom-[max(9.25rem,calc(env(safe-area-inset-bottom)+8rem))] left-[max(0.85rem,env(safe-area-inset-left))] max-w-[12rem] font-ui text-[11px] leading-4 text-paper/75">
          Stick to walk · drag to look · tap to open
        </p>
      )}
    </div>
  );
}
