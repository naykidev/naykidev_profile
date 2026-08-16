import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { MathUtils, PerspectiveCamera, Vector3 } from "three";
import { tourStops } from "@/data/locations";
import { movementFromKeys } from "@/hooks/useKeyboard";
import {
  AWARDS_X,
  GALLERY_DOOR_WIDTH,
  GALLERY_HEIGHT,
  GALLERY_SIZE_X,
  GALLERY_SIZE_Z,
  GALLERY_X,
  GALLERY_Z,
  awardsDoorX,
  galleryDoorX,
  galleryInteriorSpawn,
} from "@/systems/campusLayout";
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

const HALL_HALF_X = GALLERY_SIZE_X / 2;
const HALL_HALF_Z = GALLERY_SIZE_Z / 2;
const HALL_CAM_PAD = 0.88;
const HALL_FRAME_Y = 2.52;
const HALL_WALL_FOV = 74;
const DEFAULT_FOV = 50;
const TOUCH_LOOK_YAW = 0.0048;
const MOUSE_LOOK_YAW = 0.0022;
const TOUCH_LOOK_PITCH = 0.0038;
const MOUSE_LOOK_PITCH = 0.0018;
const LOOK_INERTIA = 9.5;

function exploreFov() {
  return typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches
    ? 62
    : DEFAULT_FOV;
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

function hallWorld(
  hall: "gallery" | "awards",
  lx: number,
  y: number,
  lz: number,
): [number, number, number] {
  if (hall === "gallery") return [GALLERY_X + lx, y, GALLERY_Z + lz];
  return [AWARDS_X - lx, y, GALLERY_Z - lz];
}

function hallWallShot(
  hall: "gallery" | "awards",
  wall: "left" | "back" | "right",
  eye: number,
  floor: number,
) {
  const lookY = floor + HALL_FRAME_Y;
  if (wall === "left") {
    return {
      pos: hallWorld(hall, 0, eye, -HALL_HALF_Z + HALL_CAM_PAD),
      look: hallWorld(hall, 0, lookY, HALL_HALF_Z),
    };
  }
  if (wall === "back") {
    return {
      pos: hallWorld(hall, -HALL_HALF_X + HALL_CAM_PAD, eye, 0),
      look: hallWorld(hall, HALL_HALF_X, lookY, 0),
    };
  }
  return {
    pos: hallWorld(hall, 0, eye, HALL_HALF_Z - HALL_CAM_PAD),
    look: hallWorld(hall, 0, lookY, -HALL_HALF_Z),
  };
}

/** Centered shot of the awards/certificates grid on the back wall. */
function awardsCertificateWallShot(floor: number) {
  const eye = floor + 2.42;
  return {
    pos: hallWorld("awards", -HALL_HALF_X + 1.2, eye, 0),
    look: hallWorld("awards", HALL_HALF_X - 0.26, floor + 3.22, 0),
  };
}

function hallDoorExitShots(hall: "gallery" | "awards", floor: number) {
  const eye = floor + 1.62;
  const outside =
    hall === "gallery"
      ? ({
          pos: [galleryDoorX() - 2.6, eye, GALLERY_Z] as [number, number, number],
          look: [0, eye + 0.06, GALLERY_Z] as [number, number, number],
        })
      : ({
          pos: [awardsDoorX() + 2.6, eye, GALLERY_Z] as [number, number, number],
          look: [0, eye + 0.06, GALLERY_Z] as [number, number, number],
        });
  return [
    {
      pos: hallWorld(hall, -HALL_HALF_X + 1.55, eye, 0),
      look: hallWorld(hall, -HALL_HALF_X - 4.4, eye, 0),
    },
    {
      pos: hallWorld(hall, -HALL_HALF_X - 0.18, eye, 0),
      look: hallWorld(hall, -HALL_HALF_X - 5.6, eye, 0),
    },
    outside,
  ];
}

function awardsDoorEnterShots(floor: number) {
  const eye = floor + 1.62;
  return [
    {
      pos: hallWorld("awards", -HALL_HALF_X + 0.35, eye, 0),
      look: hallWorld("awards", HALL_HALF_X - 0.26, floor + 3.22, 0),
    },
    awardsCertificateWallShot(floor),
  ];
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
        pathFrom.current = null;
        pathLookFrom.current = null;
      }
      if (state.mode !== prev.mode) {
        tourTime.current = 0;
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
  }, []);

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

      if (hall) {
        const floor = getTerrainHeight(
          hall === "gallery" ? galleryDoorX() : awardsDoorX(),
          GALLERY_Z,
        );
        const eye = floor + GALLERY_HEIGHT * 0.42;
        const moveDur = state.reducedMotion ? 0.08 : 1.85;
        const holdDur = state.reducedMotion ? 0.35 : 2.8;
        const spawn = galleryInteriorSpawn();
        const enterShot = {
          pos: [spawn.x, floor + 1.62, spawn.z] as [number, number, number],
          look: [
            GALLERY_X + GALLERY_SIZE_X / 2 - 0.35,
            floor + 2.48,
            GALLERY_Z,
          ] as [number, number, number],
        };
        const exitMove = state.reducedMotion ? 0.08 : 1.25;
        const exitHold = state.reducedMotion ? 0.08 : 0.18;
        const shots =
          hall === "awards"
            ? awardsDoorEnterShots(floor)
            : [
                enterShot,
                hallWallShot(hall, "left", eye, floor),
                hallWallShot(hall, "back", eye, floor),
                hallWallShot(hall, "right", eye, floor),
                ...hallDoorExitShots("gallery", floor),
              ];
        const awardsFov = 58;
        const moves =
          hall === "awards"
            ? [state.reducedMotion ? 0.1 : 1.55, state.reducedMotion ? 0.1 : 1.7]
            : [
                moveDur,
                moveDur,
                moveDur,
                moveDur,
                exitMove,
                exitMove,
                state.reducedMotion ? 0.08 : 1.35,
              ];
        const holds =
          hall === "awards"
            ? [state.reducedMotion ? 0.12 : 0.35, state.reducedMotion ? 0.7 : 4.6]
            : [holdDur, holdDur, holdDur, holdDur, exitHold, exitHold, state.reducedMotion ? 0.2 : 0.45];
        const fovs =
          hall === "awards"
            ? [DEFAULT_FOV, awardsFov]
            : [
                DEFAULT_FOV,
                HALL_WALL_FOV,
                HALL_WALL_FOV,
                HALL_WALL_FOV,
                DEFAULT_FOV,
                DEFAULT_FOV,
                DEFAULT_FOV,
              ];
        const doorWait = state.reducedMotion ? 0 : 0.85;
        const pathDur = state.reducedMotion ? 0.12 : 3.6;

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
              state.setInterior("awards");
            }
            return;
          }

          desired.set(...outdoorCam);
          const speed = state.reducedMotion ? 8 : 1.35;
          camera.position.lerp(desired, 1 - Math.exp(-speed * capped));
          lookTarget.set(...stop.lookAt);
          camera.lookAt(lookTarget);
          setCameraFov(camera, DEFAULT_FOV);
          tourTime.current += capped;
          const dist = camera.position.distanceTo(desired);
          if (dist < 0.7 || tourTime.current > 4.2) {
            arrived.current = true;
            tourTime.current = 0;
            state.setInterior("gallery");
          }
          return;
        }

        tourTime.current += capped;
        let elapsed = tourTime.current;

        if (elapsed < doorWait) {
          camera.position.set(...outdoorCam);
          lookTarget.set(...stop.lookAt);
          camera.lookAt(lookTarget);
          setCameraFov(camera, DEFAULT_FOV);
          if (hall === "awards" && state.interior !== "awards") state.setInterior("awards");
          if (hall === "gallery" && state.interior !== "gallery") state.setInterior("gallery");
          return;
        }
        elapsed -= doorWait;

        for (let i = 0; i < shots.length; i += 1) {
          const fromShot = i === 0 ? { pos: outdoorCam, look: stop.lookAt } : shots[i - 1];
          const toShot = shots[i];
          const hold = holds[i];
          const move = moves[i] ?? moveDur;
          const fromFov = i === 0 ? DEFAULT_FOV : fovs[i - 1];
          const toFov = fovs[i];

          if (hall === "gallery" && i === shots.length - 1 && elapsed >= move && state.interior) {
            state.setInterior(null);
          }

          if (elapsed < move) {
            const t = elapsed / move;
            const ease = t * t * (3 - 2 * t);
            fromPos.set(...fromShot.pos);
            toPos.set(...toShot.pos);
            fromLook.set(...fromShot.look);
            toLook.set(...toShot.look);
            camera.position.lerpVectors(fromPos, toPos, ease);
            lookTarget.lerpVectors(fromLook, toLook, ease);
            camera.lookAt(lookTarget);
            setCameraFov(camera, MathUtils.lerp(fromFov, toFov, ease));
            return;
          }
          elapsed -= move;
          if (elapsed < hold) {
            camera.position.set(...toShot.pos);
            lookTarget.set(...toShot.look);
            camera.lookAt(lookTarget);
            setCameraFov(camera, toFov);
            return;
          }
          elapsed -= hold;
        }

        arrived.current = false;
        tourTime.current = 0;
        pathFrom.current = null;
        pathLookFrom.current = null;
        state.advanceTour();
        return;
      }

      desired.set(...outdoorCam);
      const speed = state.reducedMotion ? 8 : 1.35;
      camera.position.lerp(desired, 1 - Math.exp(-speed * capped));
      lookTarget.set(...stop.lookAt);
      camera.lookAt(lookTarget);
      setCameraFov(camera, DEFAULT_FOV);
      tourTime.current += capped;
      const dist = camera.position.distanceTo(desired);
      if (!arrived.current && (dist < 0.7 || tourTime.current > 4.2)) {
        arrived.current = true;
        tourTime.current = 0;
        state.openPanel(stop.panel);
      }
      if (arrived.current && tourTime.current > (state.reducedMotion ? 1.2 : 5.2)) {
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
