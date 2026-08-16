import {
  AWARDS_X,
  GALLERY_SIZE_X,
  GALLERY_SIZE_Z,
  GALLERY_X,
  GALLERY_Z,
} from "@/systems/campusLayout";
import type { InteriorId } from "@/systems/store";

export type Collider = {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
};

export const colliders: Collider[] = [
  { minX: -18, maxX: 18, minZ: -32, maxZ: -16.6 },
  { minX: -3.2, maxX: 3.2, minZ: -14.5, maxZ: -12.2 },
  { minX: 6, maxX: 18, minZ: -34, maxZ: -24 },
  {
    minX: GALLERY_X - GALLERY_SIZE_X / 2 + 0.08,
    maxX: GALLERY_X + GALLERY_SIZE_X / 2,
    minZ: GALLERY_Z - GALLERY_SIZE_Z / 2,
    maxZ: GALLERY_Z + GALLERY_SIZE_Z / 2,
  },
  {
    minX: AWARDS_X - GALLERY_SIZE_X / 2,
    maxX: AWARDS_X + GALLERY_SIZE_X / 2 - 0.08,
    minZ: GALLERY_Z - GALLERY_SIZE_Z / 2,
    maxZ: GALLERY_Z + GALLERY_SIZE_Z / 2,
  },
];

const GALLERY_INSET = 0.78;

export function resolveCollision(
  x: number,
  z: number,
  radius = 0.7,
  interior: InteriorId = null,
): { x: number; z: number } {
  if (interior === "gallery" || interior === "awards") {
    const originX = interior === "gallery" ? GALLERY_X : AWARDS_X;
    return {
      x: Math.max(
        originX - GALLERY_SIZE_X / 2 + GALLERY_INSET,
        Math.min(originX + GALLERY_SIZE_X / 2 - GALLERY_INSET, x),
      ),
      z: Math.max(
        GALLERY_Z - GALLERY_SIZE_Z / 2 + GALLERY_INSET,
        Math.min(GALLERY_Z + GALLERY_SIZE_Z / 2 - GALLERY_INSET, z),
      ),
    };
  }

  let nextX = x;
  let nextZ = z;
  for (const box of colliders) {
    const insideX = nextX + radius > box.minX && nextX - radius < box.maxX;
    const insideZ = nextZ + radius > box.minZ && nextZ - radius < box.maxZ;
    if (!insideX || !insideZ) continue;
    const overlapLeft = nextX + radius - box.minX;
    const overlapRight = box.maxX - (nextX - radius);
    const overlapNear = nextZ + radius - box.minZ;
    const overlapFar = box.maxZ - (nextZ - radius);
    const minOverlap = Math.min(overlapLeft, overlapRight, overlapNear, overlapFar);
    if (minOverlap === overlapLeft) nextX = box.minX - radius;
    else if (minOverlap === overlapRight) nextX = box.maxX + radius;
    else if (minOverlap === overlapNear) nextZ = box.minZ - radius;
    else nextZ = box.maxZ + radius;
  }
  nextX = Math.max(-48, Math.min(48, nextX));
  nextZ = Math.max(-42, Math.min(72, nextZ));
  return { x: nextX, z: nextZ };
}
