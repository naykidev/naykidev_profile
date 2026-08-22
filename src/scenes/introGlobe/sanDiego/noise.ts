export function hash2(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

export function valueNoise(x: number, z: number) {
  const xi = Math.floor(x);
  const zi = Math.floor(z);
  const xf = x - xi;
  const zf = z - zi;
  const u = xf * xf * (3 - 2 * xf);
  const v = zf * zf * (3 - 2 * zf);
  return (
    hash2(xi, zi) * (1 - u) * (1 - v) +
    hash2(xi + 1, zi) * u * (1 - v) +
    hash2(xi, zi + 1) * (1 - u) * v +
    hash2(xi + 1, zi + 1) * u * v
  );
}

export function shoreXAt(z: number) {
  return 11 + Math.sin(z * 0.07) * 5.5 + Math.cos(z * 0.031) * 2.2;
}

/** Soft rolling coastal hills with a sandy drop into the Pacific (+X). */
export function coastHeight(x: number, z: number) {
  const hills =
    Math.sin(x * 0.042 + 0.4) * 1.45 +
    Math.cos(z * 0.036) * 1.7 +
    Math.sin((x * 0.7 + z) * 0.028) * 0.85 +
    valueNoise(x * 0.045, z * 0.04) * 1.15;
  let h = 2.15 + hills;
  const edge = shoreXAt(z);
  const inland = edge - x;
  if (inland > 2.4 && inland < 44) {
    const t = Math.min(1, (inland - 2.4) / 3.2);
    const streetDeck = 2.12 + inland * 0.028;
    h = h * (1 - t * 0.84) + streetDeck * (t * 0.84);
  }
  if (x > edge - 1.2) {
    const t = Math.min(1, (x - (edge - 1.2)) / 5.5);
    h = h * (1 - t) + -0.06 * t;
  }
  if (x > edge + 4.8) h = -0.42;
  // Mild bowl only in the playable cove — avoids a hard cliff at the mesh rim
  const r2 = x * x + z * z;
  h -= Math.min(1.8, r2 * 0.00018);
  return h;
}

/**
 * Extended landscape height for the large surround mesh.
 * Continues hills/coast without the playable-area bowl, so fog can hide
 * the far rim instead of showing a triangular cut.
 */
export function coastHeightFar(x: number, z: number) {
  const hills =
    Math.sin(x * 0.028 + 0.2) * 2.4 +
    Math.cos(z * 0.024) * 2.8 +
    Math.sin((x * 0.55 + z) * 0.018) * 1.4 +
    valueNoise(x * 0.028, z * 0.026) * 2.1 +
    valueNoise(x * 0.012 + 9, z * 0.011) * 3.2;
  let h = 1.6 + hills * 0.85;
  const edge = shoreXAt(z) + Math.sin(z * 0.015) * 8;
  if (x > edge - 2) {
    const t = Math.min(1, (x - (edge - 2)) / 18);
    h = h * (1 - t) + -0.35 * t;
  }
  if (x > edge + 14) h = -0.5;
  // Soft inland rise toward distant ridges (never a sharp drop at mesh edge)
  const inland = Math.max(0, edge - x - 30);
  h += Math.min(4.5, inland * 0.04) * (0.55 + valueNoise(x * 0.008, z * 0.008) * 0.45);
  return h;
}
