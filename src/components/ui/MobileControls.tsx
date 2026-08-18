import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useTouchUi } from "@/hooks/useCoarsePointer";
import { haptic } from "@/lib/haptics";
import { tryInteract } from "@/systems/interaction";
import { useAppStore } from "@/systems/store";

const DEADZONE = 0.13;
const BASE_SIZE = 112;
const KNOB_SIZE = 48;
const MAX_TRAVEL = (BASE_SIZE - KNOB_SIZE) / 2;
const RECENTER_MS = 180;
const HINT_MS = 5500;

function analogFromDelta(dx: number, dy: number) {
  const mag = Math.hypot(dx, dy);
  const clamped = Math.min(MAX_TRAVEL, mag);
  const px = mag > 1e-6 ? (dx / mag) * clamped : 0;
  const py = mag > 1e-6 ? (dy / mag) * clamped : 0;
  const analog = clamped / MAX_TRAVEL;
  if (analog <= DEADZONE) return { move: { x: 0, z: 0 }, x: px, y: py };
  const t = (analog - DEADZONE) / (1 - DEADZONE);
  const curved = t * t;
  return {
    move: { x: (px / MAX_TRAVEL) * curved, z: (py / MAX_TRAVEL) * curved },
    x: px,
    y: py,
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
  const overlayRef = useRef<HTMLDivElement>(null);
  const knobEl = useRef<HTMLDivElement>(null);
  const stickId = useRef<number | null>(null);
  const origin = useRef<{ x: number; y: number } | null>(null);
  const knobRef = useRef({ x: 0, y: 0 });
  const recenter = useRef<number | null>(null);
  const [originPos, setOriginPos] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const [openLabel, setOpenLabel] = useState("");
  const [openVisible, setOpenVisible] = useState(false);

  const paintKnob = (x: number, y: number) => {
    knobRef.current = { x, y };
    setKnob({ x, y });
    if (knobEl.current) knobEl.current.style.transform = `translate(${x}px, ${y}px)`;
  };

  const stopRecenter = () => {
    if (recenter.current) {
      cancelAnimationFrame(recenter.current);
      recenter.current = null;
    }
  };

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
      stopRecenter();
      setMove({ x: 0, z: 0 });
    };
  }, [setMove]);

  if (!touchUi || mode !== "explore" || activePanel || galleryProjectId) return null;

  const localPoint = (clientX: number, clientY: number) => {
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return { x: clientX, y: clientY };
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const easeKnobHome = () => {
    stopRecenter();
    const start = { ...knobRef.current };
    const t0 = performance.now();
    const tick = (now: number) => {
      if (stickId.current !== null) return;
      const t = Math.min(1, (now - t0) / RECENTER_MS);
      const e = 1 - (1 - t) ** 3;
      paintKnob(start.x * (1 - e), start.y * (1 - e));
      if (t < 1) {
        recenter.current = requestAnimationFrame(tick);
        return;
      }
      paintKnob(0, 0);
      setOriginPos(null);
      setDragging(false);
      recenter.current = null;
    };
    recenter.current = requestAnimationFrame(tick);
  };

  const onZoneDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (stickId.current !== null) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    stopRecenter();
    stickId.current = event.pointerId;
    const point = localPoint(event.clientX, event.clientY);
    origin.current = point;
    setOriginPos(point);
    setDragging(true);
    paintKnob(0, 0);
    setMove({ x: 0, z: 0 });
    dismissControlHint();
  };

  const onZoneMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (stickId.current !== event.pointerId || !origin.current) return;
    event.preventDefault();
    event.stopPropagation();
    const point = localPoint(event.clientX, event.clientY);
    const result = analogFromDelta(point.x - origin.current.x, point.y - origin.current.y);
    paintKnob(result.x, result.y);
    setMove(result.move);
  };

  const onZoneUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (stickId.current !== event.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    stickId.current = null;
    origin.current = null;
    setMove({ x: 0, z: 0 });
    easeKnobHome();
  };

  return (
    <div ref={overlayRef} className="pointer-events-none absolute inset-0 z-20">
      <div
        data-look-block
        className="pointer-events-auto absolute bottom-0 left-0 h-[42%] w-[46%] touch-none landscape:h-[78%] landscape:w-[34%]"
        style={{ touchAction: "none" }}
        onPointerDown={onZoneDown}
        onPointerMove={onZoneMove}
        onPointerUp={onZoneUp}
        onPointerCancel={onZoneUp}
        aria-label="Move"
      />
      <div
        className="pointer-events-none absolute"
        style={{
          width: BASE_SIZE,
          height: BASE_SIZE,
          left: originPos ? 0 : "max(1.1rem, env(safe-area-inset-left))",
          top: originPos ? 0 : undefined,
          bottom: originPos ? undefined : "max(1.35rem, env(safe-area-inset-bottom))",
          transform: originPos
            ? `translate(${originPos.x}px, ${originPos.y}px) translate(-50%, -50%)`
            : undefined,
        }}
      >
        <div
          className={`flex h-full w-full items-center justify-center rounded-full border border-white/20 bg-black/50 shadow-[0_8px_28px_rgba(0,0,0,0.45)] backdrop-blur-[8px] transition-[transform,opacity] duration-150 ease-out ${
            dragging ? "scale-105 opacity-100" : "scale-100 opacity-90"
          }`}
        >
          <div
            ref={knobEl}
            className="rounded-full border border-white/50 bg-white/55 shadow-[0_2px_10px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.55)]"
            style={{
              width: KNOB_SIZE,
              height: KNOB_SIZE,
              transform: `translate(${knob.x}px, ${knob.y}px)`,
            }}
          />
        </div>
      </div>
      <button
        type="button"
        data-look-block
        className={`overlay-chip pointer-events-auto absolute left-1/2 z-10 min-h-11 -translate-x-1/2 rounded-full px-5 py-3 font-ui text-[11px] tracking-[0.18em] uppercase transition duration-200 ease-out landscape:left-[62%] ${
          openVisible ? "scale-100 opacity-100" : "pointer-events-none scale-90 opacity-0"
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
        className={`overlay-label absolute left-[max(0.85rem,env(safe-area-inset-left))] max-w-[12rem] font-ui text-[11px] leading-4 tracking-[0.12em] normal-case transition duration-300 ${
          controlHint && !openVisible ? "opacity-100" : "pointer-events-none opacity-0"
        } bottom-[max(9.25rem,calc(env(safe-area-inset-bottom)+8rem))] landscape:bottom-[max(7.2rem,calc(env(safe-area-inset-bottom)+6rem))]`}
      >
        Stick to walk · drag to look · tap to open
      </p>
    </div>
  );
}
