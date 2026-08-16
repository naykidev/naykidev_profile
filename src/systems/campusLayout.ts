export const HALL_Z = -24;
export const HALL_Y = 3.55;
export const TERRACE_Y = 3.75;
export const TERRACE_SURFACE = 0.2;
export const TERRACE_FRONT_Z = -11.05;
export const LINCOLN_Z = -13.35;

/** Foot of the mall, looking up toward Bascom (−Z). */
export const EXPLORE_SPAWN = {
  x: 0,
  z: 35.2,
  yaw: 0,
  pitch: -0.05,
} as const;

/** Right side of the mall, near spawn. Entrance faces the path (−X). */
export const GALLERY_X = 14.85;
export const GALLERY_Z = 18.4;
export const GALLERY_SIZE_X = 8.8;
export const GALLERY_SIZE_Z = 12.6;
export const GALLERY_HEIGHT = 6.45;
export const GALLERY_DOOR_WIDTH = 2.42;
export const GALLERY_DOOR_HEIGHT = 3.18;
export const GALLERY_EYE = 1.62;

export function galleryDoorX() {
  return GALLERY_X - GALLERY_SIZE_X / 2;
}

export const AWARDS_X = -GALLERY_X;

export function awardsDoorX() {
  return -galleryDoorX();
}

export function galleryEnterPos(): [number, number, number] {
  return [galleryDoorX() - 2.35, 0, GALLERY_Z];
}

export function galleryInteriorSpawn(): { x: number; z: number; yaw: number; pitch: number } {
  return {
    x: GALLERY_X - 1.85,
    z: GALLERY_Z,
    yaw: -Math.PI / 2,
    pitch: 0.08,
  };
}

export function galleryExitPos(): [number, number, number] {
  return [galleryDoorX() + 1.05, 0, GALLERY_Z];
}

export function galleryOutdoorRestore(): { x: number; z: number; yaw: number; pitch: number } {
  return {
    x: galleryDoorX() - 2.55,
    z: GALLERY_Z,
    yaw: Math.PI / 2,
    pitch: -0.05,
  };
}

export function awardsInteriorSpawn(): { x: number; z: number; yaw: number; pitch: number } {
  return {
    x: AWARDS_X + 1.85,
    z: GALLERY_Z,
    yaw: Math.PI / 2,
    pitch: 0.08,
  };
}

export function awardsOutdoorRestore(): { x: number; z: number; yaw: number; pitch: number } {
  return {
    x: awardsDoorX() + 2.55,
    z: GALLERY_Z,
    yaw: -Math.PI / 2,
    pitch: -0.05,
  };
}

export function galleryFootprintContains(x: number, z: number, pad = 6.5) {
  const absX = Math.abs(x);
  return (
    absX > GALLERY_X - GALLERY_SIZE_X / 2 - pad &&
    absX < GALLERY_X + GALLERY_SIZE_X / 2 + pad &&
    z > GALLERY_Z - GALLERY_SIZE_Z / 2 - pad &&
    z < GALLERY_Z + GALLERY_SIZE_Z / 2 + pad
  );
}

/** Mall spur from the limestone walk to either gallery. */
export function galleryApproachContains(x: number, z: number, pad = 2.35) {
  const door = galleryDoorX();
  return Math.abs(x) > 2.1 && Math.abs(x) < door + 0.35 && Math.abs(z - GALLERY_Z) < pad;
}
