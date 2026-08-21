import { create } from "zustand";
import { awardPieces } from "@/data/achievements";
import { galleryPieces } from "@/data/projects";
import { locations, tourStops, type PanelKind, type WorldLocation } from "@/data/locations";
import {
  GALLERY_X,
  GALLERY_Z,
  GALLERY_SIZE_X,
  AWARDS_X,
  galleryDoorX,
  awardsDoorX,
  galleryInteriorSpawn,
  galleryOutdoorRestore,
  awardsInteriorSpawn,
  awardsOutdoorRestore,
  EXPLORE_SPAWN,
} from "@/systems/campusLayout";
import { createIntroPlayback, markIntroSeen, prefersReducedMotion } from "@/systems/introSequence";
import { haptic } from "@/lib/haptics";
import { getTerrainHeight } from "@/systems/terrain";

export type AppMode = "intro" | "explore" | "tour";
export type InteriorId = "gallery" | "awards" | null;
export type TourKind = "full" | "projects" | "awards";

export type CameraTransition = {
  kind: "enter-gallery" | "exit-gallery" | "enter-awards" | "exit-awards";
  duration: number;
  from: [number, number, number];
  to: [number, number, number];
  lookFrom: [number, number, number];
  lookTo: [number, number, number];
};

type AppState = {
  mode: AppMode;
  webgl: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  pointerLocked: boolean;
  exploreNav: boolean;
  controlHint: boolean;
  nearby: WorldLocation | null;
  activePanel: PanelKind | null;
  interior: InteriorId;
  cameraTransition: CameraTransition | null;
  galleryProjectId: string | null;
  tourIndex: number;
  tourKind: TourKind;
  tourShotIndex: number;
  tourComplete: boolean;
  tourExhibit: string | null;
  player: { x: number; y: number; z: number; yaw: number; pitch: number };
  look: { x: number; y: number };
  move: { x: number; z: number };
  gpuShadows: boolean;
  introStartedAt: number;
  introShortened: boolean;
  introForcedEnd: boolean;
  setMode: (mode: AppMode) => void;
  skipIntro: () => void;
  setWebgl: (webgl: boolean) => void;
  toggleHighContrast: () => void;
  setReducedMotion: (value: boolean) => void;
  setPointerLocked: (value: boolean) => void;
  setExploreNav: (value: boolean) => void;
  dismissControlHint: () => void;
  setNearby: (id: string | null) => void;
  openPanel: (panel: PanelKind) => void;
  closePanel: () => void;
  enterGallery: () => void;
  enterAwards: () => void;
  exitGallery: () => void;
  setInterior: (interior: InteriorId) => void;
  completeCameraTransition: () => void;
  setGalleryProject: (id: string | null) => void;
  setTourIndex: (index: number) => void;
  setTourExhibit: (name: string | null) => void;
  startProjectsTour: () => void;
  startAwardsTour: () => void;
  advanceTour: () => void;
  advanceTourPiece: () => void;
  retreatTourPiece: () => void;
  setPlayer: (partial: Partial<AppState["player"]>) => void;
  setLook: (look: { x: number; y: number }) => void;
  setMove: (move: { x: number; z: number }) => void;
  setGpuShadows: (gpuShadows: boolean) => void;
};

export const useAppStore = create<AppState>((set, get) => ({
  mode: "intro",
  webgl: true,
  highContrast: false,
  reducedMotion: prefersReducedMotion(),
  pointerLocked: false,
  exploreNav: false,
  controlHint: false,
  nearby: null,
  activePanel: null,
  interior: null,
  cameraTransition: null,
  galleryProjectId: null,
  tourIndex: 0,
  tourKind: "full",
  tourShotIndex: 0,
  tourComplete: false,
  tourExhibit: null,
  player: {
    x: EXPLORE_SPAWN.x,
    y: getTerrainHeight(EXPLORE_SPAWN.x, EXPLORE_SPAWN.z),
    z: EXPLORE_SPAWN.z,
    yaw: EXPLORE_SPAWN.yaw,
    pitch: EXPLORE_SPAWN.pitch,
  },
  look: { x: 0, y: 0 },
  move: { x: 0, z: 0 },
  gpuShadows: false,
  ...createIntroPlayback(prefersReducedMotion()),
  setMode: (mode) =>
    set({
      mode,
      activePanel: null,
      interior: null,
      cameraTransition: null,
      galleryProjectId: null,
      tourIndex: 0,
      tourKind: "full",
      tourShotIndex: 0,
      tourComplete: false,
      tourExhibit: null,
      pointerLocked: false,
      exploreNav: false,
      controlHint: mode === "explore",
      ...(mode === "intro"
        ? createIntroPlayback(get().reducedMotion, { skipCinematic: true })
        : {}),
      ...(mode === "explore"
        ? {
            player: {
              x: EXPLORE_SPAWN.x,
              y: getTerrainHeight(EXPLORE_SPAWN.x, EXPLORE_SPAWN.z),
              z: EXPLORE_SPAWN.z,
              yaw: EXPLORE_SPAWN.yaw,
              pitch: EXPLORE_SPAWN.pitch,
            },
          }
        : {}),
    }),
  skipIntro: () => {
    markIntroSeen();
    set({ introForcedEnd: true });
  },
  setWebgl: (webgl) => set({ webgl }),
  toggleHighContrast: () => set({ highContrast: !get().highContrast }),
  setReducedMotion: (reducedMotion) =>
    set({
      reducedMotion,
      ...(reducedMotion && get().mode === "intro" ? { introShortened: true } : {}),
    }),
  setPointerLocked: (pointerLocked) => set({ pointerLocked }),
  setExploreNav: (exploreNav) =>
    set({
      exploreNav,
      move: exploreNav ? get().move : { x: 0, z: 0 },
    }),
  dismissControlHint: () => set({ controlHint: false }),
  setNearby: (id) =>
    set({ nearby: locations.find((location) => location.id === id) ?? null }),
  openPanel: (panel) => {
    if (document.pointerLockElement) document.exitPointerLock();
    haptic(14);
    set({ activePanel: panel });
  },
  closePanel: () => {
    haptic(8);
    set({ activePanel: null });
  },
  setInterior: (interior) => set({ interior }),
  enterGallery: () => {
    const state = get();
    if (state.interior || state.cameraTransition) return;
    if (document.pointerLockElement) document.exitPointerLock();
    const floor = getTerrainHeight(galleryDoorX(), GALLERY_Z);
    const spawn = galleryInteriorSpawn();
    const { player, reducedMotion } = state;
    set({
      pointerLocked: false,
      activePanel: null,
      galleryProjectId: null,
      exploreNav: true,
      cameraTransition: {
        kind: "enter-gallery",
        duration: reducedMotion ? 0.05 : 2.2,
        from: [player.x, player.y + 1.62, player.z],
        to: [spawn.x, floor + 1.62, spawn.z],
        lookFrom: [
          player.x - Math.sin(player.yaw) * 5,
          player.y + 1.5,
          player.z - Math.cos(player.yaw) * 5,
        ],
        lookTo: [GALLERY_X + GALLERY_SIZE_X / 2 - 0.35, floor + 2.48, GALLERY_Z],
      },
    });
  },
  enterAwards: () => {
    const state = get();
    if (state.interior || state.cameraTransition) return;
    if (document.pointerLockElement) document.exitPointerLock();
    const floor = getTerrainHeight(awardsDoorX(), GALLERY_Z);
    const spawn = awardsInteriorSpawn();
    const { player, reducedMotion } = state;
    set({
      pointerLocked: false,
      activePanel: null,
      galleryProjectId: null,
      exploreNav: true,
      cameraTransition: {
        kind: "enter-awards",
        duration: reducedMotion ? 0.05 : 2.2,
        from: [player.x, player.y + 1.62, player.z],
        to: [spawn.x, floor + 1.62, spawn.z],
        lookFrom: [
          player.x - Math.sin(player.yaw) * 5,
          player.y + 1.5,
          player.z - Math.cos(player.yaw) * 5,
        ],
        lookTo: [AWARDS_X - GALLERY_SIZE_X / 2 + 0.35, floor + 2.48, GALLERY_Z],
      },
    });
  },
  exitGallery: () => {
    const state = get();
    if (!state.interior || state.cameraTransition) return;
    if (document.pointerLockElement) document.exitPointerLock();
    const awards = state.interior === "awards";
    const floor = getTerrainHeight(awards ? awardsDoorX() : galleryDoorX(), GALLERY_Z);
    const restore = awards ? awardsOutdoorRestore() : galleryOutdoorRestore();
    const { player, reducedMotion } = state;
    set({
      pointerLocked: false,
      galleryProjectId: null,
      exploreNav: true,
      cameraTransition: {
        kind: awards ? "exit-awards" : "exit-gallery",
        duration: reducedMotion ? 0.05 : 2.2,
        from: [player.x, player.y + 1.62, player.z],
        to: [restore.x, floor + 1.62, restore.z],
        lookFrom: [
          player.x - Math.sin(player.yaw) * 5,
          player.y + 1.5,
          player.z - Math.cos(player.yaw) * 5,
        ],
        lookTo: [
          restore.x - Math.sin(restore.yaw) * 6,
          floor + 1.7,
          restore.z - Math.cos(restore.yaw) * 6,
        ],
      },
    });
  },
  completeCameraTransition: () => {
    const { cameraTransition } = get();
    if (!cameraTransition) return;
    if (cameraTransition.kind === "enter-gallery") {
      const floor = getTerrainHeight(galleryDoorX(), GALLERY_Z);
      const spawn = galleryInteriorSpawn();
      set({
        interior: "gallery",
        cameraTransition: null,
        nearby: locations.find((location) => location.id === "gallery-exit") ?? null,
        player: {
          x: spawn.x,
          y: floor,
          z: spawn.z,
          yaw: spawn.yaw,
          pitch: spawn.pitch,
        },
      });
      return;
    }
    if (cameraTransition.kind === "enter-awards") {
      const floor = getTerrainHeight(awardsDoorX(), GALLERY_Z);
      const spawn = awardsInteriorSpawn();
      set({
        interior: "awards",
        cameraTransition: null,
        nearby: locations.find((location) => location.id === "awards-exit") ?? null,
        player: {
          x: spawn.x,
          y: floor,
          z: spawn.z,
          yaw: spawn.yaw,
          pitch: spawn.pitch,
        },
      });
      return;
    }
    if (cameraTransition.kind === "exit-awards") {
      const floor = getTerrainHeight(awardsDoorX(), GALLERY_Z);
      const restore = awardsOutdoorRestore();
      set({
        interior: null,
        cameraTransition: null,
        nearby: locations.find((location) => location.id === "awards-gallery") ?? null,
        player: {
          x: restore.x,
          y: floor,
          z: restore.z,
          yaw: restore.yaw,
          pitch: restore.pitch,
        },
      });
      return;
    }
    const floor = getTerrainHeight(galleryDoorX(), GALLERY_Z);
    const restore = galleryOutdoorRestore();
    set({
      interior: null,
      cameraTransition: null,
      nearby: locations.find((location) => location.id === "projects-gallery") ?? null,
      player: {
        x: restore.x,
        y: floor,
        z: restore.z,
        yaw: restore.yaw,
        pitch: restore.pitch,
      },
    });
  },
  setGalleryProject: (galleryProjectId) => {
    if (galleryProjectId && document.pointerLockElement) document.exitPointerLock();
    haptic(galleryProjectId ? 14 : 8);
    set({ galleryProjectId });
  },
  setTourIndex: (tourIndex) => set({ tourIndex, tourExhibit: null, tourShotIndex: 0 }),
  setTourExhibit: (tourExhibit) => {
    if (get().tourExhibit === tourExhibit) return;
    set({ tourExhibit });
  },
  startProjectsTour: () => {
    const tourIndex = tourStops.findIndex((stop) => stop.tourInterior === "gallery");
    if (tourIndex < 0) return;
    if (document.pointerLockElement) document.exitPointerLock();
    haptic(14);
    set({
      mode: "tour",
      tourKind: "projects",
      tourIndex,
      tourShotIndex: 0,
      tourComplete: false,
      tourExhibit: null,
      activePanel: null,
      interior: null,
      cameraTransition: null,
      galleryProjectId: null,
      pointerLocked: false,
      exploreNav: false,
      controlHint: false,
    });
  },
  startAwardsTour: () => {
    const tourIndex = tourStops.findIndex((stop) => stop.tourInterior === "awards");
    if (tourIndex < 0) return;
    if (document.pointerLockElement) document.exitPointerLock();
    haptic(14);
    set({
      mode: "tour",
      tourKind: "awards",
      tourIndex,
      tourShotIndex: 0,
      tourComplete: false,
      tourExhibit: null,
      activePanel: null,
      interior: null,
      cameraTransition: null,
      galleryProjectId: null,
      pointerLocked: false,
      exploreNav: false,
      controlHint: false,
    });
  },
  advanceTour: () => {
    const { tourIndex, tourKind } = get();
    if (tourKind !== "full") {
      get().advanceTourPiece();
      return;
    }
    if (tourIndex >= tourStops.length - 1) {
      set({
        tourComplete: true,
        activePanel: null,
        galleryProjectId: null,
        cameraTransition: null,
        tourExhibit: null,
      });
      return;
    }
    set({
      activePanel: null,
      tourIndex: tourIndex + 1,
      tourShotIndex: 0,
      interior: null,
      galleryProjectId: null,
      tourComplete: false,
      tourExhibit: null,
    });
  },
  advanceTourPiece: () => {
    const { tourKind, tourShotIndex, tourIndex } = get();
    const hall = tourStops[tourIndex]?.tourInterior;
    const count =
      tourKind === "awards" || hall === "awards"
        ? awardPieces.length
        : galleryPieces.length;
    if (tourShotIndex >= count - 1) {
      if (tourKind === "full") {
        get().advanceTour();
        return;
      }
      set({
        tourComplete: true,
        activePanel: null,
        galleryProjectId: null,
        cameraTransition: null,
        tourExhibit: null,
        interior: null,
      });
      return;
    }
    set({
      tourShotIndex: tourShotIndex + 1,
      tourExhibit: null,
    });
  },
  retreatTourPiece: () => {
    const { tourShotIndex } = get();
    if (tourShotIndex <= 0) return;
    set({
      tourShotIndex: tourShotIndex - 1,
      tourExhibit: null,
    });
  },
  setPlayer: (partial) => set({ player: { ...get().player, ...partial } }),
  setLook: (look) => set({ look }),
  setMove: (move) => set({ move }),
  setGpuShadows: (gpuShadows) => set({ gpuShadows }),
}));
