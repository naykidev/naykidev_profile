import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useTouchUi } from "@/hooks/useCoarsePointer";
import { haptic } from "@/lib/haptics";
import { tryInteract } from "@/systems/interaction";
import { useAppStore } from "@/systems/store";

const DEADZONE = 0.13;
const STICK_RADIUS = 50;
const RECENTER_MS = 150;
const HINT_MS = 5500;

function analogFromDelta(dx: number, dy: number) {
  const nx = dx / STICK_RADIUS;
  const ny = dy / STICK_RADIUS;
  const mag = Math.hypot(nx, ny);
  const clamped = Math.min(1, mag);
  const knob =
    mag > 1e-6
      ? { x: (nx / mag) * clamped, y: (ny / mag) * clamped }
      : { x: 0, y: 0 };
  if (clamped <= DEADZONE) return { move: { x: 0, z: 0 }, knob };
  const t = (clamped - DEADZONE) / (1 - DEADZONE);
  const curved = t * t;
  return {
    move: { x: (nx / mag) * curved, z: (ny / mag) * curved },
    knob,
  };
}

export function MobileControls() {
  const mode = useAppStore((s) => s.mode);
  const nearby = useAppStore((s) => s.nearby);
  const activePanel = useAppStore((s) => s.activePanel);
  const galleryProjectId = useAppStore((s) => s.galleryProjectId);
  const cameraTransition = useAppStore((s) => s.cameraTransition);
  const controlHint = useAppStore((s) => s.controlHint);
  const dismissControlHint = useAppStore((s) => s.dismissControlHint);
  const setMove = useAppStore((s) => s.setMove);
  const touchUi = useTouchUi();
  const stickId = useRef<number | null>(null);
  const origin = useRef<{ x: number; y: number } | null>(null);
  const knobRef = useRef({ x: 0, y: 0 });
  const recenter = useRef<number | null>(null);
  const [originPos, setOriginPos] = useState<{ x: number; y: number } | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const [openLabel, setOpenLabel] = useState("");
  const [openVisible, setOpenVisible] = useState(false);

  useEffect(() => {
    if (mode !== "explore") return;
    const id = window.setTimeout(() => dismissControlHint(), HINT_MS);
    return () => window.clearTimeout(id);
  }, [dismissControlHint, mode]);

  useEffect(() => {
    if (nearby && !cameraTransition) {
      setOpenLabel(nearby.name);
      setOpenVisible(true);
      return;
    }
    setOpenVisible(false);
  }, [cameraTransition, nearby]);

  useEffect(() => {
    return () => {
      if (recenter.current) cancelAnimationFrame(recenter.current);
      setMove({ x: 0, z: 0 });
    };
  }, [setMove]);

  if (!touchUi || mode !== "explore" || activePanel || galleryProjectId) return null;

  const stopRecenter = () => {
    if (recenter.current) {
      cancelAnimationFrame(recenter.current);
      recenter.current = null;
    }
  };

  const easeKnobHome = () => {
    stopRecenter();
    const start = { ...knobRef.current };
    const t0 = performance.now();
    const tick = (now: number) => {
      if (stickId.current !== null) return;
      const t = Math.min(1, (now - t0) / RECENTER_MS);
      const e = 1 - (1 - t) ** 3;
      const next = { x: start.x * (1 - e), y: start.y * (1 - e) };
      knobRef.current = next;
      setKnob(next);
      if (t < 1) {
        recenter.current = requestAnimationFrame(tick);
        return;
      }
      knobRef.current = { x: 0, y: 0 };
      setKnob({ x: 0, y: 0 });
      setOriginPos(null);
      recenter.current = null;
    };
    recenter.current = requestAnimationFrame(tick);
  };

  const onZoneDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (stickId.current !== null) return;
    event.preventDefault();
    event.stopPropagation();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    stopRecenter();
    stickId.current = event.pointerId;
    origin.current = { x: event.clientX, y: event.clientY };
    setOriginPos({ x: event.clientX, y: event.clientY });
    knobRef.current = { x: 0, y: 0 };
    setKnob({ x: 0, y: 0 });
    dismissControlHint();
  };

  const onZoneMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (stickId.current !== event.pointerId || !origin.current) return;
    event.preventDefault();
    event.stopPropagation();
    const result = analogFromDelta(
      event.clientX - origin.current.x,
      event.clientY - origin.current.y,
    );
    knobRef.current = result.knob;
    setKnob(result.knob);
    setMove(result.move);
  };

  const onZoneUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (stickId.current !== event.pointerId) return;
    event.stopPropagation();
    stickId.current = null;
    origin.current = null;
    setMove({ x: 0, z: 0 });
    easeKnobHome();
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <div
        data-look-block
        className="pointer-events-auto absolute bottom-0 left-0 h-[42%] w-[46%] touch-none landscape:h-[78%] landscape:w-[34%]"
        onPointerDown={onZoneDown}
        onPointerMove={onZoneMove}
        onPointerUp={onZoneUp}
        onPointerCancel={onZoneUp}
        aria-label="Move"
      />
      <div
        className="pointer-events-none absolute h-[100px] w-[100px] rounded-full border border-white/20 bg-black/30 backdrop-blur-[10px]"
        style={
          originPos
            ? { left: originPos.x, top: originPos.y, transform: "translate(-50%, -50%)" }
            : {
                left: "max(1rem, env(safe-area-inset-left))",
                bottom: "max(1.35rem, env(safe-area-inset-bottom))",
              }
        }
      >
        <div
          className="absolute top-1/2 left-1/2 h-[60px] w-[60px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-white/35"
          style={{
            transform: `translate(calc(-50% + ${knob.x * 28}px), calc(-50% + ${knob.y * 28}px))`,
          }}
        />
      </div>
      <button
        type="button"
        data-look-block
        className={`pointer-events-auto absolute left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/20 bg-black/45 px-5 py-3 font-ui text-[11px] tracking-[0.18em] text-paper uppercase backdrop-blur-[10px] transition duration-200 ease-out landscape:left-[62%] ${
          openVisible
            ? "scale-100 opacity-100"
            : "pointer-events-none scale-90 opacity-0"
        } bottom-[max(7.75rem,calc(env(safe-area-inset-bottom)+6.5rem))] landscape:bottom-[max(1.4rem,env(safe-area-inset-bottom))]`}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => {
          haptic(14);
          tryInteract();
        }}
      >
        Open {openLabel}
      </button>
      <p
        className={`absolute left-[max(0.85rem,env(safe-area-inset-left))] max-w-[12rem] font-ui text-[11px] leading-4 text-paper/75 transition duration-300 ${
          controlHint && !openVisible ? "opacity-100" : "pointer-events-none opacity-0"
        } bottom-[max(9.25rem,calc(env(safe-area-inset-bottom)+8rem))] landscape:bottom-[max(7.2rem,calc(env(safe-area-inset-bottom)+6rem))]`}
      >
        Stick to walk · drag to look · tap to open
      </p>
    </div>
  );
}
