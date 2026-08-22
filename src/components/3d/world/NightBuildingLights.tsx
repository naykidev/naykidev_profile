import { useEffect, useLayoutEffect, useRef } from "react";
import { Object3D, SpotLight as ThreeSpotLight } from "three";
import {
  AWARDS_X,
  GALLERY_DOOR_HEIGHT,
  GALLERY_SIZE_X,
  GALLERY_X,
  GALLERY_Z,
  HALL_Y,
  HALL_Z,
  awardsDoorX,
  galleryDoorX,
} from "@/systems/campusLayout";
import { getTerrainHeight } from "@/systems/terrain";
import { bollardBronze, bollardGlass, doorGlass, glass, litWindow } from "./materials";

/** ~3000K warm white LED */
const LED = "#ffdcc0";
const LED_SOFT = "#ffe8d2";

/** Mall path is ~7.4 wide; bollards sit just off the limestone edge. */
const PATH_EDGE_X = 4.35;
const MALL_BOLLARD_Z = [38, 30, 22, 14, 6, -2, -10] as const;
const BANNER_Z = [32, 22, 12, 2, -8] as const;

function syncNightMaterials(glow: number) {
  const g = Math.max(0, Math.min(1, glow));
  glass.emissive.set(g > 0.08 ? "#ffd4a8" : "#1a2430");
  glass.emissiveIntensity = 0.08 + g * 0.95;
  doorGlass.emissive.set(g > 0.08 ? "#ffd4a8" : "#1a2430");
  doorGlass.emissiveIntensity = 0.06 + g * 0.75;
  litWindow.emissive.set("#ffd4a8");
  litWindow.emissiveIntensity = g * 1.15;
  // Soft frosted glow — kept low so bloom stays cinematic, not cartoon.
  bollardGlass.emissiveIntensity = g * 0.55;
}

function AimedSpot({
  position,
  target,
  intensity,
  distance = 6,
  angle = 0.55,
  penumbra = 0.75,
  castShadow = false,
}: {
  position: [number, number, number];
  target: [number, number, number];
  intensity: number;
  distance?: number;
  angle?: number;
  penumbra?: number;
  castShadow?: boolean;
}) {
  const light = useRef<ThreeSpotLight>(null);
  const aim = useRef<Object3D>(null);

  useLayoutEffect(() => {
    if (!light.current || !aim.current) return;
    light.current.target = aim.current;
    light.current.target.updateMatrixWorld();
  }, [position, target]);

  if (intensity < 0.02) return null;

  return (
    <>
      <spotLight
        ref={light}
        position={position}
        intensity={intensity}
        distance={distance}
        decay={2}
        angle={angle}
        penumbra={penumbra}
        color={LED}
        castShadow={castShadow}
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-bias={-0.0001}
        shadow-normalBias={0.025}
        shadow-radius={4}
      />
      <object3D ref={aim} position={target} />
    </>
  );
}

/**
 * Slim campus pathway bollard (~1m): bronze stem + frosted cylindrical diffuser + cap.
 * Spotlight aims down for a controlled ground pool.
 */
function PathwayBollard({
  position,
  glow,
  strength = 1,
}: {
  position: [number, number, number];
  glow: number;
  strength?: number;
}) {
  const g = glow * strength;
  if (g < 0.04) return null;

  return (
    <>
      <group position={position}>
        <mesh position={[0, 0.02, 0]} material={bollardBronze} castShadow receiveShadow>
          <cylinderGeometry args={[0.095, 0.1, 0.04, 16]} />
        </mesh>
        <mesh position={[0, 0.38, 0]} material={bollardBronze} castShadow>
          <cylinderGeometry args={[0.032, 0.038, 0.68, 12]} />
        </mesh>
        <mesh position={[0, 0.73, 0]} material={bollardBronze}>
          <cylinderGeometry args={[0.048, 0.042, 0.04, 14]} />
        </mesh>
        <mesh position={[0, 0.86, 0]} material={bollardGlass}>
          <cylinderGeometry args={[0.052, 0.052, 0.2, 16]} />
        </mesh>
        <mesh position={[0, 0.98, 0]} material={bollardBronze}>
          <cylinderGeometry args={[0.058, 0.05, 0.045, 14]} />
        </mesh>
      </group>
      <AimedSpot
        position={[position[0], position[1] + 0.82, position[2]]}
        target={[position[0], position[1] + 0.02, position[2]]}
        intensity={0.45 + g * 0.55}
        distance={5.2}
        angle={0.68}
        penumbra={0.82}
      />
      <pointLight
        position={[position[0], position[1] + 0.82, position[2]]}
        intensity={0.12 + g * 0.18}
        distance={4.5}
        decay={2}
        color={LED_SOFT}
      />
    </>
  );
}

/**
 * Recessed ground can — almost flush, frosted lens, soft up-wash for signs/banners.
 * No floating orb; housing reads as installed hardware.
 */
function GroundCan({
  position,
  target,
  glow,
  strength = 1,
  distance = 5.5,
  angle = 0.62,
}: {
  position: [number, number, number];
  target: [number, number, number];
  glow: number;
  strength?: number;
  distance?: number;
  angle?: number;
}) {
  const g = glow * strength;
  if (g < 0.04) return null;

  return (
    <>
      <group position={position}>
        <mesh position={[0, 0.015, 0]} material={bollardBronze} receiveShadow>
          <cylinderGeometry args={[0.09, 0.095, 0.03, 16]} />
        </mesh>
        <mesh position={[0, 0.035, 0]} material={bollardGlass}>
          <cylinderGeometry args={[0.055, 0.055, 0.02, 14]} />
        </mesh>
      </group>
      <AimedSpot
        position={[position[0], position[1] + 0.08, position[2]]}
        target={target}
        intensity={0.55 + g * 0.7}
        distance={distance}
        angle={angle}
        penumbra={0.78}
      />
    </>
  );
}

/**
 * Vertical bronze wall sconce with frosted panel — for gallery / hall entrances.
 */
function EntranceSconce({
  position,
  target,
  glow,
  yaw = 0,
  strength = 1,
}: {
  position: [number, number, number];
  target: [number, number, number];
  glow: number;
  yaw?: number;
  strength?: number;
}) {
  const g = glow * strength;
  if (g < 0.04) return null;

  return (
    <>
      <group position={position} rotation={[0, yaw, 0]}>
        <mesh position={[0, 0, 0]} material={bollardBronze} castShadow>
          <boxGeometry args={[0.08, 0.42, 0.06]} />
        </mesh>
        <mesh position={[0.02, 0, 0.045]} material={bollardGlass}>
          <boxGeometry args={[0.04, 0.34, 0.03]} />
        </mesh>
        <mesh position={[0, 0.24, 0]} material={bollardBronze}>
          <boxGeometry args={[0.09, 0.04, 0.07]} />
        </mesh>
      </group>
      <AimedSpot
        position={[position[0], position[1], position[2]]}
        target={target}
        intensity={0.5 + g * 0.65}
        distance={5.5}
        angle={0.55}
        penumbra={0.7}
      />
      <pointLight
        position={[position[0], position[1], position[2]]}
        intensity={0.1 + g * 0.14}
        distance={4}
        decay={2}
        color={LED_SOFT}
      />
    </>
  );
}

function WindowPane({
  position,
  size,
}: {
  position: [number, number, number];
  size: [number, number, number];
}) {
  return (
    <mesh position={position} material={litWindow}>
      <boxGeometry args={size} />
    </mesh>
  );
}

function BascomWash({ glow }: { glow: number }) {
  const i = glow * 0.55;
  if (i < 0.04) return null;
  const terraceY = getTerrainHeight(0, HALL_Z + 10);
  return (
    <group>
      <pointLight
        position={[0, HALL_Y + 4.4, HALL_Z + 9]}
        intensity={i * 0.55}
        distance={13}
        decay={2}
        color={LED}
      />
      <pointLight
        position={[-9.5, HALL_Y + 3.8, HALL_Z + 7.4]}
        intensity={i * 0.32}
        distance={10}
        decay={2}
        color={LED_SOFT}
      />
      <pointLight
        position={[9.5, HALL_Y + 3.8, HALL_Z + 7.4]}
        intensity={i * 0.32}
        distance={10}
        decay={2}
        color={LED_SOFT}
      />
      {/* Terrace approach bollards */}
      <PathwayBollard position={[-3.6, terraceY, HALL_Z + 12.2]} glow={glow} strength={0.95} />
      <PathwayBollard position={[3.6, terraceY, HALL_Z + 12.2]} glow={glow} strength={0.95} />
      {/* Bucky banner — recessed cans */}
      <GroundCan
        position={[-1.4, HALL_Y + 0.28, HALL_Z + 8.6]}
        target={[0, HALL_Y + 5.0, HALL_Z + 6.65]}
        glow={glow}
        strength={0.9}
        distance={7}
        angle={0.5}
      />
      <GroundCan
        position={[1.4, HALL_Y + 0.28, HALL_Z + 8.6]}
        target={[0, HALL_Y + 5.0, HALL_Z + 6.65]}
        glow={glow}
        strength={0.9}
        distance={7}
        angle={0.5}
      />
    </group>
  );
}

function SideBuildingWindows({ glow }: { glow: number }) {
  const cx = 20;
  const cz = -16;
  const halfX = 5;
  const base = getTerrainHeight(cx, cz) - 0.18;
  const faceX = cx - halfX - 0.04;
  const i = glow * 0.55;
  const panes: [number, number, number][] = [];
  for (const row of [1.4, 3.2, 5.0]) {
    for (const z of [-2.4, -0.8, 0.8, 2.4]) {
      panes.push([faceX, base + row, cz + z]);
    }
  }
  return (
    <group>
      {panes.map((p) => (
        <WindowPane key={`${p[1]}-${p[2]}`} position={p} size={[0.08, 1.15, 1.05]} />
      ))}
      {glow > 0.08 ? (
        <pointLight
          position={[cx - halfX - 1.0, base + 3.4, cz]}
          intensity={i}
          distance={11}
          decay={2}
          color={LED}
        />
      ) : null}
      {[-2, 0, 2].map((z) => (
        <WindowPane
          key={`e-${z}`}
          position={[cx + halfX + 0.04, base + 3.2, cz + z]}
          size={[0.08, 1.15, 1.05]}
        />
      ))}
    </group>
  );
}

function GalleryWindows({
  x,
  doorSign,
  glow,
}: {
  x: number;
  doorSign: 1 | -1;
  glow: number;
}) {
  const y = getTerrainHeight(x, GALLERY_Z);
  const faceX = x + doorSign * (GALLERY_SIZE_X / 2 + 0.05);
  const i = glow * 0.5;
  const zs = [-4.2, -2.1, 2.1, 4.2];
  return (
    <group>
      {zs.map((z) => (
        <group key={z}>
          <WindowPane position={[faceX, y + 2.2, GALLERY_Z + z]} size={[0.08, 1.5, 1.2]} />
          <WindowPane position={[faceX, y + 4.15, GALLERY_Z + z]} size={[0.08, 1.2, 1.2]} />
        </group>
      ))}
      {glow > 0.08 ? (
        <pointLight
          position={[faceX - doorSign * 1.2, y + 3.1, GALLERY_Z]}
          intensity={i}
          distance={10}
          decay={2}
          color={LED_SOFT}
        />
      ) : null}
    </group>
  );
}

/** Evenly spaced pathway bollards along Bascom Mall. */
function MallPathLights({ glow }: { glow: number }) {
  return (
    <group>
      {MALL_BOLLARD_Z.map((z) => {
        const yL = getTerrainHeight(-PATH_EDGE_X, z);
        const yR = getTerrainHeight(PATH_EDGE_X, z);
        return (
          <group key={z}>
            <PathwayBollard position={[-PATH_EDGE_X, yL, z]} glow={glow} />
            <PathwayBollard position={[PATH_EDGE_X, yR, z]} glow={glow} />
          </group>
        );
      })}
    </group>
  );
}

/** Sign / banner / entrance architectural lighting. */
function SignAndEntranceLights({ glow }: { glow: number }) {
  if (glow < 0.04) return null;

  const wayfindZ = GALLERY_Z + 2.55;
  const projectsOrigin: [number, number, number] = [5.22, getTerrainHeight(5.22, wayfindZ), wayfindZ];
  const awardsOrigin: [number, number, number] = [-5.22, getTerrainHeight(-5.22, wayfindZ), wayfindZ];
  const projectsYaw = -0.62;
  const awardsYaw = 0.62;

  const frontOf = (
    origin: [number, number, number],
    yaw: number,
    dist: number,
  ): [number, number, number] => [
    origin[0] + Math.sin(yaw) * dist,
    origin[1],
    origin[2] + Math.cos(yaw) * dist,
  ];

  const projectsTarget: [number, number, number] = [
    projectsOrigin[0],
    projectsOrigin[1] + 1.32,
    projectsOrigin[2],
  ];
  const awardsTarget: [number, number, number] = [
    awardsOrigin[0],
    awardsOrigin[1] + 1.4,
    awardsOrigin[2],
  ];

  const projectsDoor = galleryDoorX();
  const awardsDoor = awardsDoorX();
  const projectsDoorY = getTerrainHeight(projectsDoor, GALLERY_Z);
  const awardsDoorY = getTerrainHeight(awardsDoor, GALLERY_Z);
  const projectsSign: [number, number, number] = [
    projectsDoor - 0.22,
    projectsDoorY + GALLERY_DOOR_HEIGHT + 0.62,
    GALLERY_Z,
  ];
  const awardsSign: [number, number, number] = [
    awardsDoor + 0.22,
    awardsDoorY + GALLERY_DOOR_HEIGHT + 0.62,
    GALLERY_Z,
  ];

  // Approach bollards on gallery spurs
  const spurZL = getTerrainHeight(-7.2, GALLERY_Z);
  const spurZR = getTerrainHeight(7.2, GALLERY_Z);

  return (
    <group>
      {/* W banners — ground cans aimed at cloth mid */}
      {BANNER_Z.map((z) =>
        ([-8.6, 8.6] as const).map((x) => {
          const y = getTerrainHeight(x, z);
          const clothX = x > 0 ? x - 0.4 : x + 0.4;
          const towardMall = x > 0 ? -1 : 1;
          return (
            <GroundCan
              key={`banner-${x}-${z}`}
              position={[clothX + towardMall * 0.5, y + 0.02, z]}
              target={[clothX, y + 2.15, z]}
              glow={glow}
              strength={0.95}
              distance={5}
              angle={0.52}
            />
          );
        }),
      )}

      {/* Wayfind wooden signs */}
      <GroundCan
        position={frontOf(projectsOrigin, projectsYaw, 1.05)}
        target={projectsTarget}
        glow={glow}
        strength={1.15}
        distance={5.8}
        angle={0.72}
      />
      <GroundCan
        position={[
          frontOf(projectsOrigin, projectsYaw, 0.9)[0] + Math.cos(projectsYaw) * 0.32,
          projectsOrigin[1],
          frontOf(projectsOrigin, projectsYaw, 0.9)[2] - Math.sin(projectsYaw) * 0.32,
        ]}
        target={projectsTarget}
        glow={glow}
        strength={0.85}
        distance={5.5}
        angle={0.65}
      />
      <GroundCan
        position={frontOf(awardsOrigin, awardsYaw, 1.1)}
        target={awardsTarget}
        glow={glow}
        strength={1.2}
        distance={6.2}
        angle={0.78}
      />
      <GroundCan
        position={[
          frontOf(awardsOrigin, awardsYaw, 0.95)[0] + Math.cos(awardsYaw) * 0.36,
          awardsOrigin[1],
          frontOf(awardsOrigin, awardsYaw, 0.95)[2] - Math.sin(awardsYaw) * 0.36,
        ]}
        target={awardsTarget}
        glow={glow}
        strength={0.9}
        distance={5.8}
        angle={0.7}
      />

      {/* Gallery approach bollards */}
      <PathwayBollard position={[-7.2, spurZL, GALLERY_Z]} glow={glow} strength={0.9} />
      <PathwayBollard position={[7.2, spurZR, GALLERY_Z]} glow={glow} strength={0.9} />
      <PathwayBollard
        position={[projectsDoor - 2.4, projectsDoorY, GALLERY_Z + 1.8]}
        glow={glow}
        strength={0.85}
      />
      <PathwayBollard
        position={[projectsDoor - 2.4, projectsDoorY, GALLERY_Z - 1.8]}
        glow={glow}
        strength={0.85}
      />
      <PathwayBollard
        position={[awardsDoor + 2.4, awardsDoorY, GALLERY_Z + 1.8]}
        glow={glow}
        strength={0.85}
      />
      <PathwayBollard
        position={[awardsDoor + 2.4, awardsDoorY, GALLERY_Z - 1.8]}
        glow={glow}
        strength={0.85}
      />

      {/* Building door titles — paired wall sconces wash full lettering */}
      <EntranceSconce
        position={[projectsDoor - 0.55, projectsSign[1], GALLERY_Z - 1.35]}
        target={[projectsSign[0], projectsSign[1], GALLERY_Z]}
        glow={glow}
        yaw={Math.PI / 2}
        strength={1.15}
      />
      <EntranceSconce
        position={[projectsDoor - 0.55, projectsSign[1], GALLERY_Z + 1.35]}
        target={[projectsSign[0], projectsSign[1], GALLERY_Z]}
        glow={glow}
        yaw={Math.PI / 2}
        strength={1.15}
      />
      <EntranceSconce
        position={[awardsDoor + 0.55, awardsSign[1], GALLERY_Z - 1.35]}
        target={[awardsSign[0], awardsSign[1], GALLERY_Z]}
        glow={glow}
        yaw={-Math.PI / 2}
        strength={1.15}
      />
      <EntranceSconce
        position={[awardsDoor + 0.55, awardsSign[1], GALLERY_Z + 1.35]}
        target={[awardsSign[0], awardsSign[1], GALLERY_Z]}
        glow={glow}
        yaw={-Math.PI / 2}
        strength={1.15}
      />
    </group>
  );
}

/** Campus night architecture lighting — bollards, cans, sconces, window glow. */
export function NightBuildingLights({ glow, enabled }: { glow: number; enabled: boolean }) {
  useEffect(() => {
    syncNightMaterials(enabled ? glow : 0);
    return () => syncNightMaterials(0);
  }, [glow, enabled]);

  if (!enabled || glow < 0.04) return null;

  return (
    <group>
      <MallPathLights glow={glow} />
      <BascomWash glow={glow} />
      <SideBuildingWindows glow={glow} />
      <GalleryWindows x={GALLERY_X} doorSign={-1} glow={glow} />
      <GalleryWindows x={AWARDS_X} doorSign={1} glow={glow} />
      <SignAndEntranceLights glow={glow} />
    </group>
  );
}
