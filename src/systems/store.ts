import { create } from "zustand";
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
import { createIntroPlayback, markIntroSeen } from "@/systems/introSequence";
import { getTerrainHeight } from "@/systems/terrain";

export type AppMode = "intro" | "explore" | "tour" | "traditional";
export type InteriorId = "gallery" | "awards" | null;

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
  tourComplete: boolean;
  player: { x: number; y: number; z: number; yaw: number; pitch: number };
  look: { x: number; y: number };
  move: { x: number; z: number };
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
  advanceTour: () => void;
  setPlayer: (partial: Partial<AppState["player"]>) => void;
  setLook: (look: { x: number; y: number }) => void;
  setMove: (move: { x: number; z: number }) => void;
};

export const useAppStore = create<AppState>((set, get) => ({
  mode: "intro",
  webgl: true,
  highContrast: false,
  reducedMotion: false,
  pointerLocked: false,
  exploreNav: false,
  controlHint: false,
  nearby: null,
  activePanel: null,
  interior: null,
  cameraTransition: null,
  galleryProjectId: null,
  tourIndex: 0,
  tourComplete: false,
  player: {
    x: EXPLORE_SPAWN.x,
    y: getTerrainHeight(EXPLORE_SPAWN.x, EXPLORE_SPAWN.z),
    z: EXPLORE_SPAWN.z,
    yaw: EXPLORE_SPAWN.yaw,
    pitch: EXPLORE_SPAWN.pitch,
  },
  look: { x: 0, y: 0 },
  move: { x: 0, z: 0 },
  ...createIntroPlayback(false),
  setMode: (mode) =>
    set({
      mode,
      activePanel: null,
      interior: null,
      cameraTransition: null,
      galleryProjectId: null,
      tourIndex: 0,
      tourComplete: false,
      pointerLocked: false,
      exploreNav: false,
      controlHint: mode === "explore",
      ...(mode === "intro" ? createIntroPlayback(get().reducedMotion) : {}),
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
  setWebgl: (webgl) => set({ webgl, mode: webgl ? get().mode : "traditional" }),
  toggleHighContrast: () => set({ highContrast: !get().highContrast }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
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
    set({ activePanel: panel });
  },
  closePanel: () => set({ activePanel: null }),
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
    set({ galleryProjectId });
  },
  setTourIndex: (tourIndex) => set({ tourIndex }),
  advanceTour: () => {
    const { tourIndex } = get();
    if (tourIndex >= tourStops.length - 1) {
      set({
        tourComplete: true,
        activePanel: null,
        galleryProjectId: null,
        cameraTransition: null,
      });
      return;
    }
    set({
      activePanel: null,
      tourIndex: tourIndex + 1,
      interior: null,
      galleryProjectId: null,
      tourComplete: false,
    });
  },
  setPlayer: (partial) => set({ player: { ...get().player, ...partial } }),
  setLook: (look) => set({ look }),
  setMove: (move) => set({ move }),
}));
