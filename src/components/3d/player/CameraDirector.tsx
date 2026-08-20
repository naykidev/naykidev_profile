import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { MathUtils, PerspectiveCamera, Vector3 } from "three";
import { tourStops } from "@/data/locations";
import { movementFromKeys } from "@/hooks/useKeyboard";
import {
  GALLERY_DOOR_WIDTH,
  GALLERY_Z,
  awardsDoorX,
  galleryDoorX,
} from "@/systems/campusLayout";
import { hallExhibitShots } from "@/systems/hallFrames";
import { resolveCollision } from "@/systems/collision";
import { findNearby } from "@/systems/interaction";
import { notePointerDown, notePointerMove } from "@/systems/lookDrag";
import { sampleIntroFromPlayback } from "@/systems/introSequence";
import { useAppStore } from "@/systems/store";
import { getTerrainHeight } from "@/systems/terrain";

const lookTarget = new Vector3();
const desired = new Vector3();
const fromPos = new Vector3();
const toPos = new Vector3();
const fromLook = new Vector3();
const toLook = new Vector3();

const DEFAULT_FOV = 50;
const PIECE_HOLD = 10;
const TOUCH_LOOK_YAW = 0.0048;
const MOUSE_LOOK_YAW = 0.0022;
const TOUCH_LOOK_PITCH = 0.0038;
const MOUSE_LOOK_PITCH = 0.0018;
const LOOK_INERTIA = 9.5;

type HallPhase = "door" | "enter" | "piece";

function isCoarsePointer() {
  return typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
}

function exploreFov() {
  return isCoarsePointer() ? 62 : DEFAULT_FOV;
}

/** Touch tours linger longer; reduced motion still snaps between shots. */
function tourPacing(reducedMotion: boolean) {
  if (reducedMotion) {
    return {
      pieceMove: 0.35,
      pieceHold: PIECE_HOLD,
      enterMove: 0.25,
      enterHold: 0.35,
      exitMove: 0.08,
      exitHold: 0.08,
      lastExitMove: 0.08,
      lastExitHold: 0.2,
      doorWait: 0.2,
      pathDur: 0.12,
      approachSpeed: 8,
      approachTimeout: 4.2,
      outdoorDwell: 1.2,
      pauseForPanel: true,
    };
  }
  const coarse = isCoarsePointer();
  return {
    // Piece-to-piece moves stay deliberate; hold is button-driven (infinite).
    pieceMove: coarse ? 2.2 : 1.85,
    pieceHold: PIECE_HOLD,
    enterMove: coarse ? 2.4 : 2.0,
    enterHold: coarse ? 1.4 : 1.1,
    exitMove: coarse ? 1.85 : 1.25,
    exitHold: coarse ? 0.35 : 0.18,
    lastExitMove: coarse ? 1.95 : 1.35,
    lastExitHold: coarse ? 0.8 : 0.45,
    doorWait: coarse ? 1.0 : 0.7,
    pathDur: coarse ? 5.4 : 3.6,
    approachSpeed: coarse ? 0.82 : 1.35,
    approachTimeout: coarse ? 7.5 : 4.2,
    outdoorDwell: coarse ? 8.5 : 5.2,
    pauseForPanel: true,
  };
}

function lookBlockedAt(x: number, y: number) {
  const hit = document.elementFromPoint(x, y);
  return Boolean(hit?.closest("[data-look-block]"));
}

function isTouchLook(event: PointerEvent) {
  return (
    event.pointerType === "touch" ||
    event.pointerType === "pen" ||
    (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches)
  );
}

function setCameraFov(camera: { fov?: number; updateProjectionMatrix: () => void }, fov: number) {
  if (!(camera instanceof PerspectiveCamera)) return;
  if (Math.abs(camera.fov - fov) < 0.05) return;
  camera.fov = fov;
  camera.updateProjectionMatrix();
}

export function CameraDirector() {
  const { camera, gl } = useThree();
  const tourTime = useRef(0);
  const piecePhaseTime = useRef(0);
  const arrived = useRef(false);
  const pathFrom = useRef<Vector3 | null>(null);
  const pathLookFrom = useRef<Vector3 | null>(null);
  const lastNearby = useRef<string | null>(null);
  const transElapsed = useRef(0);
  const transKey = useRef<string | null>(null);
  const enterCooldown = useRef(0);
  const lookPointerId = useRef<number | null>(null);
  const lookLast = useRef({ x: 0, y: 0, t: 0 });
  const lookVel = useRef({ yaw: 0, pitch: 0 });
  const lastPieceShot = useRef(-1);
  const hallPhase = useRef<HallPhase>("door");

  useEffect(() => {
    const el = gl.domElement;
    el.style.touchAction = "none";
    const onMove = (event: PointerEvent) => {
      if (lookPointerId.current !== event.pointerId) return;
      const { mode, activePanel, setPlayer, player, galleryProjectId, cameraTransition, dismissControlHint } =
        useAppStore.getState();
      if (mode !== "explore" || activePanel || galleryProjectId || cameraTransition) return;
      notePointerMove(event.clientX, event.clientY);
      el.style.cursor = "grabbing";
      const now = performance.now();
      const dx = event.movementX || event.clientX - lookLast.current.x;
      const dy = event.movementY || event.clientY - lookLast.current.y;
      const dt = Math.max(0.008, (now - lookLast.current.t) / 1000);
      lookLast.current = { x: event.clientX, y: event.clientY, t: now };
      const touch = isTouchLook(event);
      const yawDelta = dx * (touch ? TOUCH_LOOK_YAW : MOUSE_LOOK_YAW);
      const pitchDelta = dy * (touch ? TOUCH_LOOK_PITCH : MOUSE_LOOK_PITCH);
      lookVel.current = { yaw: yawDelta / dt, pitch: pitchDelta / dt };
      setPlayer({
        yaw: player.yaw - yawDelta,
        pitch: MathUtils.clamp(player.pitch - pitchDelta, -1.1, 0.9),
      });
      dismissControlHint();
    };
    const onDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      if (lookPointerId.current !== null) return;
      const { mode, activePanel, galleryProjectId, cameraTransition } = useAppStore.getState();
      if (mode !== "explore" || activePanel || galleryProjectId || cameraTransition) return;
      if (lookBlockedAt(event.clientX, event.clientY)) return;
      lookPointerId.current = event.pointerId;
      lookLast.current = { x: event.clientX, y: event.clientY, t: performance.now() };
      lookVel.current = { yaw: 0, pitch: 0 };
      el.setPointerCapture(event.pointerId);
      el.style.cursor = "grabbing";
      notePointerDown(event.clientX, event.clientY);
    };
    const onUp = (event?: PointerEvent) => {
      if (event && lookPointerId.current !== null && event.pointerId !== lookPointerId.current) return;
      lookPointerId.current = null;
      if (useAppStore.getState().mode === "explore") el.style.cursor = "grab";
    };
    const onLock = () => {
      useAppStore.getState().setPointerLocked(document.pointerLockElement === el);
    };
    el.style.cursor = "grab";
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("pointerleave", onUp);
    document.addEventListener("pointerlockchange", onLock);
    const onMenu = (event: Event) => {
      if (
        useAppStore.getState().interior === "gallery" ||
        useAppStore.getState().interior === "awards"
      ) {
        event.preventDefault();
      }
    };
    el.addEventListener("contextmenu", onMenu);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("pointerleave", onUp);
      document.removeEventListener("pointerlockchange", onLock);
      el.removeEventListener("contextmenu", onMenu);
      el.style.cursor = "";
    };
  }, [gl]);

  useEffect(() => {
    const unsub = useAppStore.subscribe((state, prev) => {
      if (state.activePanel && !prev.activePanel && document.pointerLockElement) {
        document.exitPointerLock();
      }
      if (state.galleryProjectId && !prev.galleryProjectId && document.pointerLockElement) {
        document.exitPointerLock();
      }
      if (state.tourIndex !== prev.tourIndex) {
        arrived.current = false;
        tourTime.current = 0;
        piecePhaseTime.current = 0;
        lastPieceShot.current = -1;
        hallPhase.current = "door";
        pathFrom.current = null;
        pathLookFrom.current = null;
      }
      if (state.tourShotIndex !== prev.tourShotIndex) {
        piecePhaseTime.current = 0;
        lastPieceShot.current = -1;
        pathFrom.current = camera.position.clone();
        pathLookFrom.current = lookTarget.clone();
      }
      if (state.mode !== prev.mode || state.tourKind !== prev.tourKind) {
        tourTime.current = 0;
        piecePhaseTime.current = 0;
        lastPieceShot.current = -1;
        hallPhase.current = "door";
        arrived.current = false;
        pathFrom.current = null;
        pathLookFrom.current = null;
      }
      if (
        prev.mode === "tour" &&
        prev.activePanel &&
        !state.activePanel &&
        state.mode === "tour" &&
        arrived.current
      ) {
        tourTime.current = 99;
      }
    });
    return unsub;
  }, [camera]);

  useFrame((_, dt) => {
    const state = useAppStore.getState();
    const capped = Math.min(dt, 0.05);

    if (state.mode === "intro") {
      const sample = sampleIntroFromPlayback(state);
      camera.position.set(sample.position[0], sample.position[1], sample.position[2]);
      lookTarget.set(sample.lookAt[0], sample.lookAt[1], sample.lookAt[2]);
      camera.lookAt(lookTarget);
      setCameraFov(camera, sample.fov);
      return;
    }

    if (state.mode === "tour") {
      if (state.tourComplete) return;
      const stop = tourStops[state.tourIndex];
      if (!stop) {
        state.setMode("intro");
        return;
      }
      const hall = stop.tourInterior;
      const outdoorCam = stop.tourCamera ?? [
        stop.position[0] + 2.4,
        stop.position[1] + 2.2,
        stop.position[2] + 6.5,
      ];
      const pacing = tourPacing(state.reducedMotion);

      if (hall) {
        const floor = getTerrainHeight(
          hall === "gallery" ? galleryDoorX() : awardsDoorX(),
          GALLERY_Z,
        );
        const shots = hallExhibitShots(hall, floor);
        const exhibitCount = Math.max(0, shots.length - 4);
        const doorWait = pacing.doorWait;
        const pathDur = pacing.pathDur;

        if (!arrived.current) {
          if (hall === "awards") {
            if (!pathFrom.current) pathFrom.current = camera.position.clone();
            if (!pathLookFrom.current) pathLookFrom.current = lookTarget.clone();
            tourTime.current += capped;
            const t = Math.min(1, tourTime.current / pathDur);
            const ease = t * t * (3 - 2 * t);
            fromPos.copy(pathFrom.current);
            toPos.set(...outdoorCam);
            fromLook.copy(pathLookFrom.current);
            toLook.set(...stop.lookAt);
            camera.position.lerpVectors(fromPos, toPos, ease);
            lookTarget.lerpVectors(fromLook, toLook, ease);
            camera.lookAt(lookTarget);
            setCameraFov(camera, DEFAULT_FOV);
            if (t >= 1) {
              arrived.current = true;
              tourTime.current = 0;
              hallPhase.current = "door";
              state.setInterior("awards");
            }
            return;
          }

          desired.set(...outdoorCam);
          camera.position.lerp(desired, 1 - Math.exp(-pacing.approachSpeed * capped));
          lookTarget.set(...stop.lookAt);
          camera.lookAt(lookTarget);
          setCameraFov(camera, DEFAULT_FOV);
          tourTime.current += capped;
          const dist = camera.position.distanceTo(desired);
          if (dist < 0.7 || tourTime.current > pacing.approachTimeout) {
            arrived.current = true;
            tourTime.current = 0;
            hallPhase.current = "door";
            state.setInterior("gallery");
          }
          return;
        }

        const enterShot = shots[0];
        const pieceShots = shots.slice(1, 1 + exhibitCount);
        if (pieceShots.length === 0 || !enterShot) {
          state.setMode("intro");
          return;
        }

        if (hallPhase.current === "door") {
          tourTime.current += capped;
          camera.position.set(...outdoorCam);
          lookTarget.set(...stop.lookAt);
          camera.lookAt(lookTarget);
          setCameraFov(camera, DEFAULT_FOV);
          if (hall === "awards" && state.interior !== "awards") state.setInterior("awards");
          if (hall === "gallery" && state.interior !== "gallery") state.setInterior("gallery");
          if (state.tourExhibit) state.setTourExhibit(null);
          if (tourTime.current >= doorWait) {
            hallPhase.current = "enter";
            tourTime.current = 0;
            pathFrom.current = camera.position.clone();
            pathLookFrom.current = lookTarget.clone();
          }
          return;
        }

        if (hallPhase.current === "enter") {
          tourTime.current += capped;
          const move = pacing.enterMove;
          if (tourTime.current < move) {
            if (state.tourExhibit) state.setTourExhibit(null);
            const t = Math.min(1, tourTime.current / move);
            const ease = t * t * (3 - 2 * t);
            fromPos.copy(pathFrom.current ?? camera.position);
            toPos.set(...enterShot.pos);
            fromLook.copy(pathLookFrom.current ?? lookTarget);
            toLook.set(...enterShot.look);
            camera.position.lerpVectors(fromPos, toPos, ease);
            lookTarget.lerpVectors(fromLook, toLook, ease);
            camera.lookAt(lookTarget);
            setCameraFov(camera, MathUtils.lerp(DEFAULT_FOV, enterShot.fov, ease));
            return;
          }

          camera.position.set(...enterShot.pos);
          lookTarget.set(...enterShot.look);
          camera.lookAt(lookTarget);
          setCameraFov(camera, enterShot.fov);

          if (tourTime.current < move + pacing.enterHold) {
            if (state.tourExhibit) state.setTourExhibit(null);
            return;
          }

          // Park inside the room, then zoom one portrait at a time (button-driven).
          hallPhase.current = "piece";
          tourTime.current = 0;
          piecePhaseTime.current = 0;
          lastPieceShot.current = -1;
          pathFrom.current = camera.position.clone();
          pathLookFrom.current = lookTarget.clone();
        }

        {
          const idx = Math.max(0, Math.min(state.tourShotIndex, pieceShots.length - 1));
          const toShot = pieceShots[idx];
          const move = pacing.pieceMove;

          if (lastPieceShot.current !== idx) {
            lastPieceShot.current = idx;
            piecePhaseTime.current = 0;
            // Prefer the subscribe-captured path; otherwise start from wherever we are.
            if (!pathFrom.current) pathFrom.current = camera.position.clone();
            if (!pathLookFrom.current) pathLookFrom.current = lookTarget.clone();
          }

          piecePhaseTime.current += capped;
          if (piecePhaseTime.current < move) {
            const t = Math.min(1, piecePhaseTime.current / move);
            const ease = t * t * (3 - 2 * t);
            // Long jumps (opposite walls) go via the room hub so we don't skim past neighbors.
            const hub = enterShot;
            const from = pathFrom.current!;
            const fromLookRef = pathLookFrom.current!;
            const longJump =
              Math.hypot(toShot.pos[0] - from.x, toShot.pos[2] - from.z) > 5.5;

            if (longJump) {
              if (t < 0.45) {
                const u = t / 0.45;
                const e = u * u * (3 - 2 * u);
                fromPos.copy(from);
                toPos.set(...hub.pos);
                fromLook.copy(fromLookRef);
                toLook.set(...hub.look);
                camera.position.lerpVectors(fromPos, toPos, e);
                lookTarget.lerpVectors(fromLook, toLook, e);
                setCameraFov(camera, MathUtils.lerp(DEFAULT_FOV, hub.fov, e));
              } else {
                const u = (t - 0.45) / 0.55;
                const e = u * u * (3 - 2 * u);
                fromPos.set(...hub.pos);
                toPos.set(...toShot.pos);
                fromLook.set(...hub.look);
                toLook.set(...toShot.look);
                camera.position.lerpVectors(fromPos, toPos, e);
                lookTarget.lerpVectors(fromLook, toLook, e);
                setCameraFov(camera, MathUtils.lerp(hub.fov, toShot.fov, e));
              }
            } else {
              fromPos.copy(from);
              toPos.set(...toShot.pos);
              fromLook.copy(fromLookRef);
              toLook.set(...toShot.look);
              camera.position.lerpVectors(fromPos, toPos, ease);
              lookTarget.lerpVectors(fromLook, toLook, ease);
              setCameraFov(camera, MathUtils.lerp(DEFAULT_FOV, toShot.fov, ease));
            }
            camera.lookAt(lookTarget);

            if (t < 0.82) {
              if (state.tourExhibit) state.setTourExhibit(null);
            } else {
              const exhibit = toShot.pieceId ?? null;
              if (state.tourExhibit !== exhibit) state.setTourExhibit(exhibit);
            }
            return;
          }

          const exhibit = toShot.pieceId ?? null;
          if (state.tourExhibit !== exhibit) state.setTourExhibit(exhibit);
          camera.position.set(...toShot.pos);
          lookTarget.set(...toShot.look);
          camera.lookAt(lookTarget);
          setCameraFov(camera, toShot.fov);
          // Stay on this portrait until Next / Previous — do not auto-advance.
          return;
        }
      }

      desired.set(...outdoorCam);
      camera.position.lerp(desired, 1 - Math.exp(-pacing.approachSpeed * capped));
      lookTarget.set(...stop.lookAt);
      camera.lookAt(lookTarget);
      setCameraFov(camera, DEFAULT_FOV);
      if (!arrived.current) {
        tourTime.current += capped;
        const dist = camera.position.distanceTo(desired);
        if (dist < 0.7 || tourTime.current > pacing.approachTimeout) {
          arrived.current = true;
          tourTime.current = 0;
          state.openPanel(stop.panel);
        }
        return;
      }
      if (pacing.pauseForPanel && state.activePanel) {
        return;
      }
      tourTime.current += capped;
      if (tourTime.current > pacing.outdoorDwell) {
        arrived.current = false;
        tourTime.current = 0;
        state.advanceTour();
      }
      return;
    }

    if (state.mode !== "explore") return;

    setCameraFov(camera, exploreFov());

    const transition = state.cameraTransition;
    if (transition) {
      if (transKey.current !== transition.kind) {
        transKey.current = transition.kind;
        transElapsed.current = 0;
      }
      transElapsed.current += capped;
      const t = Math.min(1, transElapsed.current / transition.duration);
      const ease = t * t * (3 - 2 * t);
      fromPos.set(...transition.from);
      toPos.set(...transition.to);
      fromLook.set(...transition.lookFrom);
      toLook.set(...transition.lookTo);
      camera.position.lerpVectors(fromPos, toPos, ease);
      lookTarget.lerpVectors(fromLook, toLook, ease);
      camera.lookAt(lookTarget);
      if (t >= 1) {
        const kind = transition.kind;
        transKey.current = null;
        state.completeCameraTransition();
        if (kind === "exit-gallery" || kind === "exit-awards") enterCooldown.current = performance.now() + 1400;
        if (kind === "enter-gallery" || kind === "enter-awards") enterCooldown.current = performance.now() + 900;
      }
      return;
    }

    if (state.look.x || state.look.y) {
      state.setPlayer({
        yaw: state.player.yaw - state.look.x * 0.01,
        pitch: MathUtils.clamp(
          state.player.pitch - state.look.y * 0.008,
          -1.1,
          0.9,
        ),
      });
      state.setLook({ x: 0, y: 0 });
    }

    if (lookPointerId.current === null) {
      const vel = lookVel.current;
      const speed = Math.hypot(vel.yaw, vel.pitch);
      if (speed > 0.08) {
        state.setPlayer({
          yaw: state.player.yaw - vel.yaw * capped,
          pitch: MathUtils.clamp(state.player.pitch - vel.pitch * capped, -1.1, 0.9),
        });
        const damp = Math.exp(-LOOK_INERTIA * capped);
        lookVel.current = { yaw: vel.yaw * damp, pitch: vel.pitch * damp };
      } else if (speed > 0) {
        lookVel.current = { yaw: 0, pitch: 0 };
      }
    }

    if (state.activePanel || state.galleryProjectId) {
      camera.position.set(state.player.x, state.player.y + 1.62, state.player.z);
      camera.rotation.order = "YXZ";
      camera.rotation.y = state.player.yaw;
      camera.rotation.x = state.player.pitch;
      return;
    }

    const keys = movementFromKeys();
    const mx = MathUtils.clamp(keys.x + state.move.x, -1, 1);
    const mz = MathUtils.clamp(keys.z + state.move.z, -1, 1);
    const length = Math.hypot(mx, mz);
    const nx = length > 1e-4 ? mx / length : 0;
    const nz = length > 1e-4 ? mz / length : 0;
    const speed = 7.4 * Math.min(1, length);
    const yaw = state.player.yaw;
    const forwardX = -Math.sin(yaw);
    const forwardZ = -Math.cos(yaw);
    const rightX = Math.cos(yaw);
    const rightZ = -Math.sin(yaw);
    let x = state.player.x + (forwardX * -nz + rightX * nx) * speed * capped;
    let z = state.player.z + (forwardZ * -nz + rightZ * nx) * speed * capped;
    const resolved = resolveCollision(x, z, 0.7, state.interior);
    x = resolved.x;
    z = resolved.z;
    const y =
      state.interior === "gallery" || state.interior === "awards"
        ? getTerrainHeight(
            state.interior === "gallery" ? galleryDoorX() : awardsDoorX(),
            GALLERY_Z,
          )
        : getTerrainHeight(x, z);
    state.setPlayer({ x, y, z });

    camera.position.set(x, y + 1.62, z);
    camera.rotation.order = "YXZ";
    camera.rotation.y = yaw;
    camera.rotation.x = state.player.pitch;

    const nearby = findNearby(x, y, z);
    const id = nearby?.id ?? null;
    if (id !== lastNearby.current) {
      lastNearby.current = id;
      state.setNearby(id);
    }

    const doorBand = Math.abs(z - GALLERY_Z) < GALLERY_DOOR_WIDTH / 2 + 0.2;
    if (
      !state.interior &&
      performance.now() > enterCooldown.current &&
      doorBand
    ) {
      const doorX = galleryDoorX();
      if (x < doorX && x > doorX - 1.5) state.enterGallery();
      const awardDoor = awardsDoorX();
      if (x > awardDoor && x < awardDoor + 1.5) state.enterAwards();
    }
    if (
      state.interior &&
      performance.now() > enterCooldown.current &&
      doorBand
    ) {
      if (state.interior === "gallery" && x < galleryDoorX() + 1.45) state.exitGallery();
      if (state.interior === "awards" && x > awardsDoorX() - 1.45) state.exitGallery();
    }
  });

  return null;
}
