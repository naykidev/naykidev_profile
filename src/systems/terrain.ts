import { TERRACE_Y, GALLERY_SIZE_X, GALLERY_SIZE_Z, GALLERY_X, GALLERY_Z } from "./campusLayout";

export function getTerrainHeight(x: number, z: number): number {
  const alongHill = 1 - smoothstep(-36, 46, z);
  const ridge = Math.exp(-(x * x) / 520);
  const terrace = 1 - smoothstep(-12, -4, z) * 0.18;
  const ripple = Math.sin(x * 0.11) * Math.cos(z * 0.07) * 0.07;
  const natural = alongHill * 5.15 * ridge * terrace + ripple;

  const across = 1 - smoothstep(18, 24, Math.abs(x));
  const along =
    (1 - smoothstep(-10.4, -7.0, z)) * smoothstep(-34.5, -31.0, z);
  const plateau = Math.max(0, Math.min(1, across * along));
  let h = natural * (1 - plateau) + TERRACE_Y * plateau;

  const inHallFloor =
    Math.abs(x) > GALLERY_X - GALLERY_SIZE_X / 2 + 0.4 &&
    Math.abs(x) < GALLERY_X + GALLERY_SIZE_X / 2 - 0.12 &&
    z > GALLERY_Z - GALLERY_SIZE_Z / 2 + 0.18 &&
    z < GALLERY_Z + GALLERY_SIZE_Z / 2 - 0.18;
  if (inHallFloor) h -= 2.1;

  const shelfX = Math.max(0, Math.abs(x - 20) - 5.05);
  const shelfZ = Math.max(0, Math.abs(z + 16) - 4.05);
  const shelf = 1 - smoothstep(0, 4.2, Math.hypot(shelfX, shelfZ));
  if (shelf > 0) {
    const ridgeShelf = Math.exp(-(20 * 20) / 520);
    const alongShelf = 1 - smoothstep(-36, 46, -16);
    const terraceShelf = 1 - smoothstep(-12, -4, -16) * 0.18;
    const target = alongShelf * 5.15 * ridgeShelf * terraceShelf;
    if (target > h) h += (target - h) * shelf;
  }

  return h;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}
