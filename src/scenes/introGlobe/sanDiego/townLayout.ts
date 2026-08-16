import { hash2, shoreXAt } from "./noise";

/** 4 m tiles at half scale = 2 scene units. Block size is an integer tile count so streets meet. */
export const NEIGH_SCALE = 0.5;
export const TILE = 4 * NEIGH_SCALE;

export const STREET_COUNT = 4;
const BLOCK = 5 * TILE;
const COAST_SETBACK = 18;
export const Z_MIN = -15 * TILE;
export const Z_MAX = 15 * TILE;
const LOT_STEP = 3 * TILE;
const HOUSE_FROM_STREET = TILE * 2;
const DRIVE_FROM_STREET = TILE;
export const CROSS_ZS = [-12 * TILE, -6 * TILE, 0, 6 * TILE, 12 * TILE];

const COAST_STREET_X = shoreXAt(0) - COAST_SETBACK;

export type Pose = {
  x: number;
  z: number;
  rot: number;
  scale: number;
  kind: string;
};

export type NeighborhoodLayout = {
  roads: Pose[];
  sidewalks: Pose[];
  driveways: Pose[];
  houses: Pose[];
  garages: Pose[];
  sheds: Pose[];
  fences: Pose[];
  mailboxes: Pose[];
  lamps: Pose[];
  cars: Pose[];
  yards: Pose[];
};

const occupied = new Set<string>();
const OCC_CELL = 1.15;

function mark(x: number, z: number, radius: number) {
  const r = radius / OCC_CELL;
  const cx = x / OCC_CELL;
  const cz = z / OCC_CELL;
  const minX = Math.floor(cx - r);
  const maxX = Math.floor(cx + r);
  const minZ = Math.floor(cz - r);
  const maxZ = Math.floor(cz + r);
  for (let ix = minX; ix <= maxX; ix += 1) {
    for (let iz = minZ; iz <= maxZ; iz += 1) {
      occupied.add(`${ix},${iz}`);
    }
  }
}

export function occupies(x: number, z: number) {
  return occupied.has(`${Math.floor(x / OCC_CELL)},${Math.floor(z / OCC_CELL)}`);
}

export function nsX(street: number) {
  return COAST_STREET_X - street * BLOCK;
}

const ROAD_HALF = TILE * 0.82;

export function onRoad(x: number, z: number) {
  if (z < Z_MIN - 1.4 || z > Z_MAX + 1.4) return 0;
  const wobble = (hash2(x * 0.31, z * 0.29) - 0.5) * 0.38;
  const half = ROAD_HALF + wobble;
  let w = 0;
  for (let street = 0; street < STREET_COUNT; street += 1) {
    const d = Math.abs(x - nsX(street));
    if (d < half) w = Math.max(w, 1 - d / half);
  }
  if (x <= nsX(0) + half && x >= nsX(STREET_COUNT - 1) - half) {
    for (const cross of CROSS_ZS) {
      const d = Math.abs(z - cross);
      if (d < half) w = Math.max(w, 1 - d / half);
    }
  }
  return w;
}

export function dirtRut(x: number, z: number) {
  let rut = 0;
  for (let street = 0; street < STREET_COUNT; street += 1) {
    const d = Math.abs(Math.abs(x - nsX(street)) - 0.34);
    if (d < 0.18) rut = Math.max(rut, 1 - d / 0.18);
  }
  for (const cross of CROSS_ZS) {
    const d = Math.abs(Math.abs(z - cross) - 0.34);
    if (d < 0.18 && x <= nsX(0) + ROAD_HALF && x >= nsX(STREET_COUNT - 1) - ROAD_HALF) {
      rut = Math.max(rut, 1 - d / 0.18);
    }
  }
  return rut;
}

export type DriveSpan = { x0: number; x1: number; z: number };
export const driveSpans: DriveSpan[] = [];

export function neighborhoodDeck(x: number) {
  return 2.16 + (nsX(0) - x) * 0.032;
}

function isCross(z: number) {
  return CROSS_ZS.some((cross) => Math.abs(z - cross) < 0.01);
}

function faceToward(fromX: number, fromZ: number, toX: number, toZ: number) {
  return Math.atan2(-(toX - fromX), -(toZ - fromZ));
}

const HOUSE_KINDS = ["bungalow", "cottage", "ranch", "twoStory"] as const;

function houseKind(i: number): (typeof HOUSE_KINDS)[number] {
  return HOUSE_KINDS[Math.floor(hash2(i, 9) * HOUSE_KINDS.length)] ?? "bungalow";
}

function houseScale(kind: (typeof HOUSE_KINDS)[number]) {
  if (kind === "cottage") return 0.78;
  if (kind === "ranch") return 0.44;
  if (kind === "twoStory") return 0.43;
  return 0.5;
}

function build(): NeighborhoodLayout {
  const roads: Pose[] = [];
  const sidewalks: Pose[] = [];
  const driveways: Pose[] = [];
  const houses: Pose[] = [];
  const garages: Pose[] = [];
  const sheds: Pose[] = [];
  const fences: Pose[] = [];
  const mailboxes: Pose[] = [];
  const lamps: Pose[] = [];
  const cars: Pose[] = [];
  const yards: Pose[] = [];

  for (let street = 0; street < STREET_COUNT; street += 1) {
    const x = nsX(street);
    for (let z = Z_MIN; z <= Z_MAX + 0.01; z += TILE) {
      const four = isCross(z);
      roads.push({
        x,
        z,
        rot: 0,
        scale: NEIGH_SCALE * 1.02,
        kind: four ? "four" : "ns",
      });
      mark(x, z, TILE * 0.7);
    }
  }

  for (const z of CROSS_ZS) {
    for (let street = 0; street < STREET_COUNT - 1; street += 1) {
      const xOcean = nsX(street);
      const xInland = nsX(street + 1);
      for (let x = xInland + TILE; x <= xOcean - TILE + 0.01; x += TILE) {
        roads.push({ x, z, rot: Math.PI / 2, scale: NEIGH_SCALE * 1.02, kind: "ew" });
        mark(x, z, TILE * 0.7);
      }
    }
  }

  let lot = 0;
  for (let street = 0; street < STREET_COUNT; street += 1) {
    const sx = nsX(street);
    const sides = street === 0 ? ([-1] as const) : street === STREET_COUNT - 1 ? ([1] as const) : ([-1, 1] as const);
    for (let z = Z_MIN + TILE; z <= Z_MAX - TILE + 0.01; z += LOT_STEP) {
      if (CROSS_ZS.some((cross) => Math.abs(z - cross) < TILE * 1.01)) continue;
      if (street === 0 && Math.abs(z - 6) < 4) continue;
      for (const side of sides) {
        const hx = sx + side * HOUSE_FROM_STREET;
        if (hx > shoreXAt(z) - 2.8) continue;
        if (hx < -38) continue;
        const kind = houseKind(lot);
        const scale = houseScale(kind);
        const rot = faceToward(hx, z, sx, z);
        houses.push({ x: hx, z, rot, scale, kind });
        mark(hx, z, 2.4);

        driveways.push({
          x: sx + side * DRIVE_FROM_STREET,
          z,
          rot: Math.PI / 2,
          scale: NEIGH_SCALE * 1.02,
          kind: "drive",
        });
        driveSpans.push({
          x0: Math.min(sx + side * TILE * 0.35, hx),
          x1: Math.max(sx + side * TILE * 0.35, hx),
          z,
        });
        mark(sx + side * DRIVE_FROM_STREET, z, 1.1);

        mailboxes.push({
          x: sx + side * (TILE * 0.72),
          z: z + TILE * 0.4 * side,
          rot,
          scale: NEIGH_SCALE,
          kind: "mail",
        });

        sidewalks.push({
          x: sx + side * TILE,
          z: z - TILE,
          rot: 0,
          scale: NEIGH_SCALE * 1.02,
          kind: "walk",
        });
        sidewalks.push({
          x: sx + side * TILE,
          z: z + TILE,
          rot: 0,
          scale: NEIGH_SCALE * 1.02,
          kind: "walk",
        });

        const backX = hx + side * 2.15;
        const frontX = sx + side * (TILE * 0.92);
        const zLo = z - 2.45;
        const zHi = z + 2.45;
        const fenceRun = 1.08;
        const alongStreet = Math.PI / 2;
        for (let fz = zLo; fz <= zHi + 0.01; fz += fenceRun) {
          if (Math.abs(fz - z) > 1.05) {
            fences.push({ x: frontX, z: fz, rot: alongStreet, scale: 0.52, kind: "fence" });
          }
          fences.push({
            x: backX,
            z: fz,
            rot: alongStreet,
            scale: 0.52,
            kind: hash2(lot + fz, 19) > 0.62 ? "privacy" : "fence",
          });
        }
        const xMin = Math.min(frontX, backX) + 0.35;
        const xMax = Math.max(frontX, backX) - 0.35;
        for (let fx = xMin; fx <= xMax + 0.01; fx += fenceRun) {
          fences.push({ x: fx, z: zLo, rot: 0, scale: 0.52, kind: "fence" });
          fences.push({ x: fx, z: zHi, rot: 0, scale: 0.52, kind: "fence" });
        }

        yards.push({
          x: hx + side * 1.2,
          z: z + 1.45,
          rot: hash2(lot, 6) * 6.28,
          scale: 0.55 + hash2(lot, 7) * 0.2,
          kind: hash2(lot, 8) > 0.45 ? "bush" : "flowers",
        });
        yards.push({
          x: hx - side * 0.15,
          z: z - 1.55,
          rot: hash2(lot, 11) * 6.28,
          scale: 0.5 + hash2(lot, 12) * 0.2,
          kind: "lawn",
        });

        if (hash2(lot, 13) > 0.58) {
          cars.push({
            x: sx + side * DRIVE_FROM_STREET,
            z,
            rot,
            scale: 0.42,
            kind: hash2(lot, 14) > 0.5 ? "family" : "sedan",
          });
        }

        if (hash2(lot, 15) > 0.74) {
          garages.push({
            x: hx + side * 0.15,
            z: z + 2.4 * (hash2(lot, 16) > 0.5 ? 1 : -1),
            rot,
            scale: 0.36,
            kind: "garage",
          });
        } else if (hash2(lot, 17) > 0.8) {
          sheds.push({
            x: backX + side * 0.35,
            z: z - 1.7,
            rot: rot + Math.PI,
            scale: 0.38,
            kind: "shed",
          });
        }

        lot += 1;
      }
    }

    for (let z = Z_MIN + TILE; z <= Z_MAX; z += TILE * 2) {
      if (isCross(z)) continue;
      lamps.push({
        x: sx + (street % 2 === 0 ? 1 : -1) * TILE * 0.55,
        z,
        rot: 0,
        scale: NEIGH_SCALE,
        kind: "lamp",
      });
    }
  }

  return {
    roads,
    sidewalks,
    driveways,
    houses,
    garages,
    sheds,
    fences,
    mailboxes,
    lamps,
    cars,
    yards,
  };
}

export const coastTown = build();

export function onPavement(x: number, z: number) {
  const road = onRoad(x, z);
  if (road > 0.02) return road;
  for (const drive of driveSpans) {
    if (x >= drive.x0 && x <= drive.x1 && Math.abs(z - drive.z) < 0.85) {
      return 0.88 * (1 - Math.abs(z - drive.z) / 0.85);
    }
  }
  return 0;
}
