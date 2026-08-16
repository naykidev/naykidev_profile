import { useRef } from "react";
import { useAppStore } from "@/systems/store";

export function MobileControls() {
  const mode = useAppStore((s) => s.mode);
  const setMove = useAppStore((s) => s.setMove);
  const setLook = useAppStore((s) => s.setLook);
  const origin = useRef<{ x: number; y: number } | null>(null);

  if (mode !== "explore") return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 sm:hidden">
      <div
        className="pointer-events-auto absolute bottom-28 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full border border-white/15 bg-black/25 backdrop-blur-[10px]"
        onPointerDown={(event) => {
          (event.target as HTMLElement).setPointerCapture(event.pointerId);
          origin.current = { x: event.clientX, y: event.clientY };
        }}
        onPointerMove={(event) => {
          if (!origin.current) return;
          const dx = (event.clientX - origin.current.x) / 48;
          const dy = (event.clientY - origin.current.y) / 48;
          setMove({
            x: Math.max(-1, Math.min(1, dx)),
            z: Math.max(-1, Math.min(1, dy)),
          });
        }}
        onPointerUp={() => {
          origin.current = null;
          setMove({ x: 0, z: 0 });
        }}
        aria-label="Move"
      />
      <div
        className="pointer-events-auto absolute right-0 bottom-0 h-2/5 w-1/2"
        onPointerMove={(event) => {
          if (event.buttons === 0 && event.pressure === 0) return;
          setLook({ x: event.movementX, y: event.movementY });
        }}
        aria-hidden
      />
    </div>
  );
}
