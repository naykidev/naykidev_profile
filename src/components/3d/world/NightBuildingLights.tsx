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
import { doorGlass, glass, litWindow, signHousing, signLamp } from "./materials";

const WARM = "#ffb366";
const WARM_SOFT = "#ffaa55";
const BANNER_Z = [32, 22, 12, 2, -8] as const;

function syncWindowMaterials(glow: number) {
  const g = Math.max(0, Math.min(1, glow));
  glass.emissive.set(g > 0.08 ? "#ffb366" : "#1a2430");
  glass.emissiveIntensity = 0.1 + g * 1.35;
  doorGlass.emissive.set(g > 0.08 ? "#ffb366" : "#1a2430");
  doorGlass.emissiveIntensity = 0.08 + g * 1.1;
  litWindow.emissive.set("#ffb366");
  litWindow.emissiveIntensity = g * 1.55;
  // Visible warmth comes from the mesh; keep below bloom clip white.
  signLamp.emissiveIntensity = g * 1.85;
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

/** Aimed spotlight with an explicit world-space target. */
function AimedSpot({
  position,
  target,
  intensity,
  distance = 7,
  angle = 0.42,
  penumbra = 0.55,
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

  if (intensity < 0.03) return null;

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
        color={WARM_SOFT}
        castShadow={castShadow}
        shadow-mapSize-width={castShadow ? 1024 : 512}
        shadow-mapSize-height={castShadow ? 1024 : 512}
        shadow-bias={-0.0001}
        shadow-normalBias={0.02}
        shadow-radius={3}
      />
      <object3D ref={aim} position={target} />
    </>
  );
}

/**
 * Ground bollard / uplight: fixture sits near the ground and washes upward
 * with a wide soft spotlight so full sign text / banner cloth is lit.
 */
function GroundUplight({
  position,
  target,
  glow,
  strength = 1,
  distance = 7,
  angle = 0.72,
  castShadow = false,
}: {
  position: [number, number, number];
  target: [number, number, number];
  glow: number;
  strength?: number;
  distance?: number;
  angle?: number;
  castShadow?: boolean;
}) {
  const g = glow * strength;
  if (g < 0.04) return null;

  return (
    <>
      <group position={position}>
        {/* Stake / housing */}
        <mesh position={[0, 0.08, 0]} material={signHousing} castShadow>
          <cylinderGeometry args={[0.045, 0.055, 0.16, 10]} />
        </mesh>
        <mesh position={[0, 0.175, 0]} material={signHousing}>
          <cylinderGeometry args={[0.07, 0.06, 0.05, 12]} />
        </mesh>
        {/* Warm lens — moderate emissive, not a clipped white orb */}
        <mesh position={[0, 0.21, 0]} material={signLamp}>
          <sphereGeometry args={[0.042, 12, 10]} />
        </mesh>
      </group>
      <AimedSpot
        position={[position[0], position[1] + 0.24, position[2]]}
        target={target}
        intensity={0.95 + g * 1.35}
        distance={distance}
        angle={angle}
        penumbra={0.72}
        castShadow={castShadow}
      />
      {/* Soft fill so edges of wide signs don't fall off */}
      <pointLight
        position={[position[0], position[1] + 0.35, position[2]]}
        intensity={0.22 + g * 0.35}
        distance={distance * 0.85}
        decay={2}
        color={WARM}
      />
    </>
  );
}

function BascomWash({ glow }: { glow: number }) {
  const i = glow * 0.95;
  if (i < 0.05) return null;
  return (
    <group>
      <pointLight
        position={[0, HALL_Y + 4.8, HALL_Z + 9.2]}
        intensity={i * 0.7}
        distance={14}
        decay={2}
        color={WARM}
      />
      <pointLight
        position={[-10.5, HALL_Y + 4.2, HALL_Z + 7.6]}
        intensity={i * 0.45}
        distance={11}
        decay={2}
        color={WARM_SOFT}
      />
      <pointLight
        position={[10.5, HALL_Y + 4.2, HALL_Z + 7.6]}
        intensity={i * 0.45}
        distance={11}
        decay={2}
        color={WARM_SOFT}
      />
      <pointLight
        position={[0, HALL_Y + 2.9, HALL_Z + 10.8]}
        intensity={i * 0.55}
        distance={9}
        decay={2}
        color={WARM_SOFT}
      />
      {/* Bucky banner — ground wash from terrace up */}
      <GroundUplight
        position={[0, HALL_Y + 0.35, HALL_Z + 8.9]}
        target={[0, HALL_Y + 5.0, HALL_Z + 6.65]}
        glow={glow}
        strength={1.1}
        distance={8}
        angle={0.55}
      />
    </group>
  );
}

function SideBuildingWindows({ glow }: { glow: number }) {
  const cx = 20;
  const cz = -16;
  const halfX = 5;
  const bodyH = 6.4;
  const base = getTerrainHeight(cx, cz) - 0.18;
  const faceX = cx - halfX - 0.04;
  const i = glow * 0.85;
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
          position={[cx - halfX - 1.1, base + bodyH * 0.55, cz]}
          intensity={i}
          distance={12}
          decay={2}
          color={WARM}
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
  const i = glow * 0.75;
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
          position={[faceX - doorSign * 1.3, y + 3.2, GALLERY_Z]}
          intensity={i}
          distance={11}
          decay={2}
          color={WARM_SOFT}
        />
      ) : null}
    </group>
  );
}

/** W banners, wayfinding planks, and gallery door titles — ground uplights. */
function SignLights({ glow }: { glow: number }) {
  if (glow < 0.04) return null;

  const wayfindZ = GALLERY_Z + 2.55;
  const projectsOrigin: [number, number, number] = [5.22, getTerrainHeight(5.22, wayfindZ), wayfindZ];
  const awardsOrigin: [number, number, number] = [-5.22, getTerrainHeight(-5.22, wayfindZ), wayfindZ];

  // Sign local +Z is the plank face; rotations match CampusBanners.
  const projectsYaw = -0.62;
  const awardsYaw = 0.62;
  const projectsFront = (dist: number): [number, number, number] => [
    projectsOrigin[0] + Math.sin(projectsYaw) * dist,
    projectsOrigin[1],
    projectsOrigin[2] + Math.cos(projectsYaw) * dist,
  ];
  const awardsFront = (dist: number): [number, number, number] => [
    awardsOrigin[0] + Math.sin(awardsYaw) * dist,
    awardsOrigin[1],
    awardsOrigin[2] + Math.cos(awardsYaw) * dist,
  ];

  // Mid-stack targets (scale 1.18) so all planks sit in the cone.
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
  // Door title plane: ~2.95 × 0.46 at DOOR_H + 0.62
  const projectsSignCenter: [number, number, number] = [
    projectsDoor - 0.2,
    projectsDoorY + GALLERY_DOOR_HEIGHT + 0.62,
    GALLERY_Z,
  ];
  const awardsSignCenter: [number, number, number] = [
    awardsDoor + 0.2,
    awardsDoorY + GALLERY_DOOR_HEIGHT + 0.62,
    GALLERY_Z,
  ];

  return (
    <group>
      {BANNER_Z.map((z) =>
        ([-8.6, 8.6] as const).map((x) => {
          const y = getTerrainHeight(x, z);
          const clothX = x > 0 ? x - 0.4 : x + 0.4;
          // Stand in front of the cloth (toward mall center) and aim up the full flag.
          const towardMall = x > 0 ? -1 : 1;
          const lamp: [number, number, number] = [clothX + towardMall * 0.55, y + 0.02, z + 0.15];
          const clothMid: [number, number, number] = [clothX, y + 2.15, z];
          return (
            <GroundUplight
              key={`banner-${x}-${z}`}
              position={lamp}
              target={clothMid}
              glow={glow}
              strength={1.05}
              distance={5.5}
              angle={0.58}
            />
          );
        }),
      )}

      {/* Projects wayfind — dual ground wash covers both planks edge-to-edge */}
      <GroundUplight
        position={projectsFront(1.15)}
        target={projectsTarget}
        glow={glow}
        strength={1.35}
        distance={6.5}
        angle={0.78}
        castShadow
      />
      <GroundUplight
        position={[
          projectsFront(0.95)[0] + Math.cos(projectsYaw) * 0.35,
          projectsOrigin[1],
          projectsFront(0.95)[2] - Math.sin(projectsYaw) * 0.35,
        ]}
        target={[projectsTarget[0], projectsTarget[1] + 0.15, projectsTarget[2]]}
        glow={glow}
        strength={0.85}
        distance={6}
        angle={0.7}
      />

      {/* Awards & Certificates wayfind — wide dual uplight for all three planks */}
      <GroundUplight
        position={awardsFront(1.2)}
        target={awardsTarget}
        glow={glow}
        strength={1.4}
        distance={7}
        angle={0.82}
        castShadow
      />
      <GroundUplight
        position={[
          awardsFront(1.0)[0] + Math.cos(awardsYaw) * 0.4,
          awardsOrigin[1],
          awardsFront(1.0)[2] - Math.sin(awardsYaw) * 0.4,
        ]}
        target={[awardsTarget[0], awardsTarget[1] + 0.1, awardsTarget[2]]}
        glow={glow}
        strength={0.9}
        distance={6.5}
        angle={0.75}
      />

      {/* Building door titles — two ground spots left/right so full lettering reads */}
      <GroundUplight
        position={[projectsDoor - 1.15, projectsDoorY + 0.05, GALLERY_Z - 0.15]}
        target={[projectsSignCenter[0] - 0.55, projectsSignCenter[1], projectsSignCenter[2]]}
        glow={glow}
        strength={1.3}
        distance={6.5}
        angle={0.62}
      />
      <GroundUplight
        position={[projectsDoor - 1.15, projectsDoorY + 0.05, GALLERY_Z + 0.15]}
        target={[projectsSignCenter[0] + 0.55, projectsSignCenter[1], projectsSignCenter[2]]}
        glow={glow}
        strength={1.3}
        distance={6.5}
        angle={0.62}
      />
      <GroundUplight
        position={[awardsDoor + 1.15, awardsDoorY + 0.05, GALLERY_Z - 0.15]}
        target={[awardsSignCenter[0] - 0.55, awardsSignCenter[1], awardsSignCenter[2]]}
        glow={glow}
        strength={1.3}
        distance={6.5}
        angle={0.62}
      />
      <GroundUplight
        position={[awardsDoor + 1.15, awardsDoorY + 0.05, GALLERY_Z + 0.15]}
        target={[awardsSignCenter[0] + 0.55, awardsSignCenter[1], awardsSignCenter[2]]}
        glow={glow}
        strength={1.3}
        distance={6.5}
        angle={0.62}
      />
    </group>
  );
}

/** Warm interior window glow + facade / sign lamps that ramp up after dusk. */
export function NightBuildingLights({ glow, enabled }: { glow: number; enabled: boolean }) {
  useEffect(() => {
    syncWindowMaterials(enabled ? glow : 0);
    return () => syncWindowMaterials(0);
  }, [glow, enabled]);

  if (!enabled || glow < 0.04) return null;

  return (
    <group>
      <BascomWash glow={glow} />
      <SideBuildingWindows glow={glow} />
      <GalleryWindows x={GALLERY_X} doorSign={-1} glow={glow} />
      <GalleryWindows x={AWARDS_X} doorSign={1} glow={glow} />
      <SignLights glow={glow} />
    </group>
  );
}
