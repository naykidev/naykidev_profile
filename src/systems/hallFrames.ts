import { awardPieces } from "@/data/achievements";
import { galleryPieces } from "@/data/projects";
import {
  AWARDS_X,
  GALLERY_SIZE_X,
  GALLERY_SIZE_Z,
  GALLERY_X,
  GALLERY_Z,
  awardsDoorX,
  awardsInteriorSpawn,
  galleryDoorX,
  galleryInteriorSpawn,
} from "@/systems/campusLayout";

export const HALL_HALF_X = GALLERY_SIZE_X / 2;
export const HALL_HALF_Z = GALLERY_SIZE_Z / 2;
export const FRAME_W = 2.32;
export const FRAME_H = 1.62;
export const FRAME_Y = 2.52;
export const FRAME_INSET = 0.26;
export const FRAME_GAP = 1.35;
export const CORNER_INSET = 0.72;
export const CERT_W = 1.64;
export const CERT_H = 1.16;
export const CERT_GAP_Z = 0.5;
export const CERT_GAP_Y = 0.38;
export const CERT_CENTER_Y = 3.22;

export type HallId = "gallery" | "awards";
export type Vec3 = [number, number, number];
export type FrameSlot = {
  position: Vec3;
  rotation: Vec3;
  scale?: number;
  tiny?: boolean;
  pieceIndex?: number;
};
export type TourShot = {
  pos: Vec3;
  look: Vec3;
  fov: number;
  label?: string;
  pieceId?: string;
};

export function centersOnSpan(count: number, a: number, b: number, size: number, gap: number) {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  const mid = (lo + hi) / 2;
  if (count <= 0) return [];
  if (count === 1) return [mid];
  const total = count * size + (count - 1) * gap;
  const first = mid - total / 2 + size / 2;
  const step = size + gap;
  return Array.from({ length: count }, (_, i) => first + i * step);
}

export function museumFrameSlots(count: number): FrameSlot[] {
  const eastZ = centersOnSpan(3, -HALL_HALF_Z + CORNER_INSET, HALL_HALF_Z - CORNER_INSET, FRAME_W, FRAME_GAP);
  const northX = centersOnSpan(2, -HALL_HALF_X + CORNER_INSET, HALL_HALF_X - CORNER_INSET, FRAME_W, FRAME_GAP);
  const southX = centersOnSpan(2, -HALL_HALF_X + CORNER_INSET, HALL_HALF_X - CORNER_INSET, FRAME_W, FRAME_GAP);
  const slots: FrameSlot[] = [
    ...eastZ.map((z) => ({
      position: [HALL_HALF_X - FRAME_INSET, FRAME_Y, z] as Vec3,
      rotation: [0, -Math.PI / 2, 0] as Vec3,
    })),
    ...northX.map((x) => ({
      position: [x, FRAME_Y, HALL_HALF_Z - FRAME_INSET] as Vec3,
      rotation: [0, Math.PI, 0] as Vec3,
    })),
    ...southX.map((x) => ({
      position: [x, FRAME_Y, -HALL_HALF_Z + FRAME_INSET] as Vec3,
      rotation: [0, 0, 0] as Vec3,
    })),
  ];
  return slots.slice(0, count).map((slot, index) => ({ ...slot, pieceIndex: index }));
}

/** Left wall → back wall → right wall, each left-to-right from inside the room. */
export function museumTourSlots(count: number): FrameSlot[] {
  const north: FrameSlot[] = [];
  const east: FrameSlot[] = [];
  const south: FrameSlot[] = [];
  for (const slot of museumFrameSlots(count)) {
    const yaw = slot.rotation[1];
    if (Math.abs(yaw - Math.PI) < 0.2) north.push(slot);
    else if (Math.abs(yaw + Math.PI / 2) < 0.2) east.push(slot);
    else south.push(slot);
  }
  north.sort((a, b) => a.position[0] - b.position[0]);
  east.sort((a, b) => b.position[2] - a.position[2]);
  south.sort((a, b) => b.position[0] - a.position[0]);
  return [...north, ...east, ...south];
}

export function awardFrameSlots(count: number): FrameSlot[] {
  const colZ = centersOnSpan(3, -1, 1, CERT_W, CERT_GAP_Z).map((z) => -z);
  const rowCount = Math.ceil(count / 3);
  const rowStep = CERT_H + CERT_GAP_Y;
  const rowY = Array.from(
    { length: rowCount },
    (_, row) => CERT_CENTER_Y + ((rowCount - 1) / 2 - row) * rowStep,
  );
  const wallX = HALL_HALF_X - FRAME_INSET;
  const yaw: Vec3 = [0, -Math.PI / 2, 0];
  return Array.from({ length: count }, (_, index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    const itemsInRow = row === rowCount - 1 ? count - row * 3 : 3;
    const z = itemsInRow === 1 ? 0 : colZ[col];
    return {
      position: [wallX, rowY[row], z] as Vec3,
      rotation: yaw,
      tiny: true,
      pieceIndex: index,
    };
  });
}

export function hallWorld(hall: HallId, lx: number, y: number, lz: number): Vec3 {
  if (hall === "gallery") return [GALLERY_X + lx, y, GALLERY_Z + lz];
  return [AWARDS_X - lx, y, GALLERY_Z - lz];
}

export function frameZoomShot(hall: HallId, slot: FrameSlot, floor: number): TourShot {
  const dist = slot.tiny ? 1.68 : 3.35;
  const yaw = slot.rotation[1];
  const [lx, ly, lz] = slot.position;
  const lookY = floor + ly - (slot.tiny ? 0.02 : 0.16);
  const camY = floor + ly - (slot.tiny ? 0.04 : 0.1);
  return {
    pos: hallWorld(hall, lx + Math.sin(yaw) * dist, camY, lz + Math.cos(yaw) * dist),
    look: hallWorld(hall, lx, lookY, lz),
    fov: slot.tiny ? 42 : 46,
  };
}

export function hallEnterShot(hall: HallId, floor: number, first: FrameSlot | undefined): TourShot {
  const spawn = hall === "gallery" ? galleryInteriorSpawn() : awardsInteriorSpawn();
  const look = first
    ? hallWorld(hall, first.position[0], floor + first.position[1], first.position[2])
    : hallWorld(hall, HALL_HALF_X - 0.35, floor + 2.48, 0);
  return {
    pos: [spawn.x, floor + 1.62, spawn.z],
    look,
    fov: 50,
  };
}

export function hallDoorExitShots(hall: HallId, floor: number): TourShot[] {
  const eye = floor + 1.62;
  const outside: TourShot =
    hall === "gallery"
      ? {
          pos: [galleryDoorX() - 2.6, eye, GALLERY_Z],
          look: [0, eye + 0.06, GALLERY_Z],
          fov: 50,
        }
      : {
          pos: [awardsDoorX() + 2.6, eye, GALLERY_Z],
          look: [0, eye + 0.06, GALLERY_Z],
          fov: 50,
        };
  return [
    {
      pos: hallWorld(hall, -HALL_HALF_X + 1.55, eye, 0),
      look: hallWorld(hall, -HALL_HALF_X - 4.4, eye, 0),
      fov: 50,
    },
    {
      pos: hallWorld(hall, -HALL_HALF_X - 0.18, eye, 0),
      look: hallWorld(hall, -HALL_HALF_X - 5.6, eye, 0),
      fov: 50,
    },
    outside,
  ];
}

export function hallExhibitShots(hall: HallId, floor: number): TourShot[] {
  const pieces = hall === "gallery" ? galleryPieces : awardPieces;
  const slots = hall === "gallery" ? museumTourSlots(pieces.length) : awardFrameSlots(pieces.length);
  return [
    hallEnterShot(hall, floor, slots[0]),
    ...slots.map((slot, index) => {
      const piece = pieces[slot.pieceIndex ?? index];
      return {
        ...frameZoomShot(hall, slot, floor),
        label: piece?.name,
        pieceId: piece?.id,
      };
    }),
    ...hallDoorExitShots(hall, floor),
  ];
}
