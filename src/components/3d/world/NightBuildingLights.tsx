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
 * Gooseneck fixture: dark housing + warm emissive bulb (not a white orb),
 * with a soft spotlight aimed at a surface target.
 */
function GooseneckFixture({
  position,
  target,
  glow,
  strength = 1,
  distance = 6.5,
  castShadow = false,
}: {
  position: [number, number, number];
  target: [number, number, number];
  glow: number;
  strength?: number;
  distance?: number;
  castShadow?: boolean;
}) {
  const g = glow * strength;
  if (g < 0.04) return null;

  const dx = target[0] - position[0];
  const dz = target[2] - position[2];
  const yaw = Math.atan2(dx, dz);

  return (
    <>
      <group position={position}>
        <mesh position={[0, 0.02, -0.1]} rotation={[0.65, yaw, 0]} material={signHousing}>
          <cylinderGeometry args={[0.016, 0.02, 0.28, 8]} />
        </mesh>
        <mesh position={[0, -0.02, 0.02]} material={signHousing}>
          <cylinderGeometry args={[0.048, 0.055, 0.04, 12]} />
        </mesh>
        <mesh position={[0, -0.045, 0.04]} material={signLamp}>
          <sphereGeometry args={[0.038, 12, 10]} />
        </mesh>
      </group>
      <AimedSpot
        position={[position[0], position[1] - 0.06, position[2] + 0.06]}
        target={target}
        intensity={0.55 + g * 0.85}
        distance={distance}
        angle={0.4}
        penumbra={0.62}
        castShadow={castShadow}
      />
    </>
  );
}

function BascomWash({ glow }: { glow: number }) {
  const i = glow * 0.95;
  if (i < 0.05) return null;
  return (
    <group>
      {/* Soft facade washes — warm, short range, physics decay */}
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
      <GooseneckFixture
        position={[0, HALL_Y + 6.2, HALL_Z + 6.95]}
        target={[0, HALL_Y + 5.1, HALL_Z + 6.65]}
        glow={glow}
        strength={1.15}
        distance={5.5}
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

/** W banners, wayfinding planks, and gallery door titles — aimed spotlights. */
function SignLights({ glow }: { glow: number }) {
  if (glow < 0.04) return null;

  const wayfindZ = GALLERY_Z + 2.55;
  const projectsY = getTerrainHeight(5.22, wayfindZ);
  const awardsY = getTerrainHeight(-5.22, wayfindZ);

  const projectsDoor = galleryDoorX();
  const awardsDoor = awardsDoorX();
  const projectsDoorY = getTerrainHeight(projectsDoor, GALLERY_Z);
  const awardsDoorY = getTerrainHeight(awardsDoor, GALLERY_Z);
  const projectsSignY = projectsDoorY + GALLERY_DOOR_HEIGHT + 0.62;
  const awardsSignY = awardsDoorY + GALLERY_DOOR_HEIGHT + 0.62;

  return (
    <group>
      {BANNER_Z.map((z) =>
        ([-8.6, 8.6] as const).map((x) => {
          const y = getTerrainHeight(x, z);
          const clothX = x > 0 ? x - 0.4 : x + 0.4;
          const lampPos: [number, number, number] = [clothX, y + 2.95, z + (x > 0 ? -0.12 : 0.12)];
          const clothTarget: [number, number, number] = [clothX, y + 2.15, z];
          return (
            <GooseneckFixture
              key={`banner-${x}-${z}`}
              position={lampPos}
              target={clothTarget}
              glow={glow}
              strength={0.9}
              distance={4.8}
            />
          );
        }),
      )}

      {/* Projects wayfind */}
      <GooseneckFixture
        position={[5.22, projectsY + 1.95, wayfindZ + 0.55]}
        target={[5.22, projectsY + 1.3, wayfindZ + 0.12]}
        glow={glow}
        strength={1.2}
        distance={5.5}
        castShadow
      />
      {/* Awards & Certificates wayfind */}
      <GooseneckFixture
        position={[-5.22, awardsY + 2.05, wayfindZ + 0.55]}
        target={[-5.22, awardsY + 1.35, wayfindZ + 0.12]}
        glow={glow}
        strength={1.25}
        distance={5.8}
        castShadow
      />

      <GooseneckFixture
        position={[projectsDoor - 0.65, projectsSignY + 0.35, GALLERY_Z]}
        target={[projectsDoor - 0.25, projectsSignY, GALLERY_Z]}
        glow={glow}
        strength={1.15}
        distance={5}
      />
      <GooseneckFixture
        position={[awardsDoor + 0.65, awardsSignY + 0.35, GALLERY_Z]}
        target={[awardsDoor + 0.25, awardsSignY, GALLERY_Z]}
        glow={glow}
        strength={1.15}
        distance={5}
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
