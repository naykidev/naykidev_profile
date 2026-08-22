import { MeshPhysicalMaterial, MeshStandardMaterial } from "three";
import { creamMap, marbleMap, sandstoneMap, slateMap } from "./textures";

export const sandstone = new MeshStandardMaterial({
  color: "#e2c79a",
  map: sandstoneMap,
  roughness: 0.86,
  metalness: 0.03,
});

export const sandstoneDeep = new MeshStandardMaterial({
  color: "#c49a68",
  map: sandstoneMap,
  roughness: 0.88,
  metalness: 0.03,
});

export const limestone = new MeshStandardMaterial({
  color: "#d8c7a6",
  roughness: 0.78,
  metalness: 0.02,
});

export const limestoneSpur = new MeshStandardMaterial({
  color: "#d4c3a2",
  roughness: 0.8,
  metalness: 0.02,
  polygonOffset: true,
  polygonOffsetFactor: -1,
  polygonOffsetUnits: -2,
});

export const bronze = new MeshStandardMaterial({
  color: "#6e5228",
  roughness: 0.42,
  metalness: 0.55,
});

export const granite = new MeshStandardMaterial({
  color: "#5c5852",
  roughness: 0.7,
  metalness: 0.12,
});

export const glass = new MeshStandardMaterial({
  color: "#8aa4b8",
  roughness: 0.18,
  metalness: 0.2,
  emissive: "#1a2430",
  emissiveIntensity: 0.15,
});

/** Extra facade panes that only read as lit at night (intensity driven in Lighting). */
export const litWindow = new MeshStandardMaterial({
  color: "#1c160c",
  emissive: "#ffd4a8",
  emissiveIntensity: 0,
  roughness: 0.45,
  metalness: 0.06,
});

/** Dark bronze / black architectural housing for campus fixtures. */
export const bollardBronze = new MeshStandardMaterial({
  color: "#161310",
  roughness: 0.42,
  metalness: 0.78,
});

/** Frosted warm diffuser — emits softly; intensity driven at night. */
export const bollardGlass = new MeshStandardMaterial({
  color: "#f3e6d2",
  emissive: "#ffd9a8",
  emissiveIntensity: 0,
  roughness: 0.82,
  metalness: 0.02,
  transparent: true,
  opacity: 0.9,
});

/** @deprecated alias — kept for any residual imports */
export const signLamp = bollardGlass;
export const signHousing = bollardBronze;

export const roofCopper = new MeshStandardMaterial({
  color: "#5f6e4e",
  roughness: 0.55,
  metalness: 0.28,
});

export const timber = new MeshStandardMaterial({
  color: "#6b4630",
  roughness: 0.74,
  metalness: 0.02,
});

export const nailHead = new MeshStandardMaterial({
  color: "#c8ccd1",
  roughness: 0.28,
  metalness: 0.82,
});

export const foliage = new MeshStandardMaterial({
  color: "#3c6a46",
  roughness: 0.95,
  metalness: 0,
});

export const foliageDark = new MeshStandardMaterial({
  color: "#2c5136",
  roughness: 0.95,
  metalness: 0,
});

export const grass = new MeshStandardMaterial({
  color: "#4a704f",
  roughness: 0.95,
  metalness: 0,
});

export const water = new MeshStandardMaterial({
  color: "#6d8ea3",
  roughness: 0.12,
  metalness: 0.35,
  emissive: "#243848",
  emissiveIntensity: 0.08,
});

export const plaster = new MeshPhysicalMaterial({
  color: "#f3ead8",
  map: creamMap,
  roughness: 0.42,
  metalness: 0.04,
  clearcoat: 0.08,
  clearcoatRoughness: 0.7,
});

export const creamStone = new MeshPhysicalMaterial({
  color: "#f6f0e4",
  map: creamMap,
  roughness: 0.38,
  metalness: 0.03,
  clearcoat: 0.12,
  clearcoatRoughness: 0.65,
});

export const slateRoof = new MeshStandardMaterial({
  color: "#4b5158",
  map: slateMap,
  roughness: 0.48,
  metalness: 0.42,
});

export const archVoid = new MeshStandardMaterial({
  color: "#1a1612",
  roughness: 1,
  metalness: 0,
});

export const windowFrame = new MeshStandardMaterial({
  color: "#ead9b8",
  roughness: 0.55,
  metalness: 0.04,
});

export const badgerRed = new MeshStandardMaterial({
  color: "#c5050c",
  roughness: 0.55,
  metalness: 0.05,
});

export const marble = new MeshStandardMaterial({
  color: "#f2ebe0",
  map: marbleMap,
  roughness: 0.28,
  metalness: 0.08,
});

export const galleryPlaster = new MeshStandardMaterial({
  color: "#efe6d6",
  roughness: 0.78,
  metalness: 0.02,
});

export const galleryTrim = new MeshStandardMaterial({
  color: "#d8c4a0",
  roughness: 0.48,
  metalness: 0.06,
});

export const doorWood = new MeshStandardMaterial({
  color: "#3a2418",
  roughness: 0.62,
  metalness: 0.04,
});

export const doorGlass = new MeshStandardMaterial({
  color: "#6d8494",
  roughness: 0.12,
  metalness: 0.28,
  transparent: true,
  opacity: 0.42,
  emissive: "#1a2430",
  emissiveIntensity: 0.12,
});

export const museumFloor = new MeshStandardMaterial({
  color: "#3a2a22",
  roughness: 0.85,
  metalness: 0,
});

export const museumWall = new MeshStandardMaterial({
  color: "#f4f0e8",
  roughness: 0.82,
  metalness: 0,
});

export const museumBaseboard = new MeshStandardMaterial({
  color: "#2c2118",
  roughness: 0.48,
  metalness: 0.08,
});

export const walnutFrame = new MeshStandardMaterial({
  color: "#3a2418",
  roughness: 0.38,
  metalness: 0.22,
});

export const brassPlaque = new MeshStandardMaterial({
  color: "#c4a35a",
  roughness: 0.32,
  metalness: 0.72,
});
