import { useEffect } from "react";
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
import { doorGlass, glass, litWindow, signLamp } from "./materials";

const WARM = "#ffc078";
const WARM_SOFT = "#ffd6a0";
const BANNER_Z = [32, 22, 12, 2, -8] as const;

function syncWindowMaterials(glow: number) {
  const g = Math.max(0, Math.min(1, glow));
  glass.emissive.set(g > 0.08 ? "#ffb45a" : "#1a2430");
  glass.emissiveIntensity = 0.12 + g * 2.4;
  doorGlass.emissive.set(g > 0.08 ? "#ffb45a" : "#1a2430");
  doorGlass.emissiveIntensity = 0.1 + g * 1.8;
  litWindow.emissiveIntensity = g * 2.8;
  litWindow.opacity = 1;
  signLamp.emissiveIntensity = g * 3.2;
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

function SignFixture({
  position,
  intensity,
  distance = 5.5,
}: {
  position: [number, number, number];
  intensity: number;
  distance?: number;
}) {
  if (intensity < 0.04) return null;
  return (
    <group position={position}>
      <mesh position={[0, 0.06, 0]} material={signLamp}>
        <sphereGeometry args={[0.055, 10, 8]} />
      </mesh>
      <mesh position={[0, 0.02, -0.08]} rotation={[0.55, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.022, 0.22, 8]} />
        <meshStandardMaterial color="#3a3228" roughness={0.55} metalness={0.35} />
      </mesh>
      <pointLight position={[0, -0.05, 0.12]} intensity={intensity} distance={distance} decay={2} color={WARM_SOFT} />
    </group>
  );
}

function BascomWash({ glow }: { glow: number }) {
  const i = glow * 2.4;
  if (i < 0.05) return null;
  return (
    <group>
      <pointLight position={[0, HALL_Y + 5.2, HALL_Z + 9.5]} intensity={i * 1.1} distance={22} decay={2} color={WARM} />
      <pointLight position={[-11, HALL_Y + 4.6, HALL_Z + 8]} intensity={i * 0.85} distance={18} decay={2} color={WARM_SOFT} />
      <pointLight position={[11, HALL_Y + 4.6, HALL_Z + 8]} intensity={i * 0.85} distance={18} decay={2} color={WARM_SOFT} />
      <pointLight position={[-16.5, HALL_Y + 4.2, HALL_Z + 6.5]} intensity={i * 0.7} distance={14} decay={2} color={WARM} />
      <pointLight position={[16.5, HALL_Y + 4.2, HALL_Z + 6.5]} intensity={i * 0.7} distance={14} decay={2} color={WARM} />
      <pointLight position={[0, HALL_Y + 3.2, HALL_Z + 11.2]} intensity={i * 0.9} distance={12} decay={2} color={WARM_SOFT} />
      <SignFixture position={[0, HALL_Y + 6.35, HALL_Z + 7.05]} intensity={glow * 1.35} distance={7} />
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
  const i = glow * 1.6;
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
          position={[cx - halfX - 1.2, base + bodyH * 0.55, cz]}
          intensity={i}
          distance={16}
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
  const i = glow * 1.35;
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
          position={[faceX - doorSign * 1.4, y + 3.4, GALLERY_Z]}
          intensity={i}
          distance={14}
          decay={2}
          color={WARM_SOFT}
        />
      ) : null}
    </group>
  );
}

/** W banners, wayfinding planks, and gallery door titles. */
function SignLights({ glow }: { glow: number }) {
  const i = glow * 1.05;
  if (i < 0.04) return null;

  const wayfindZ = GALLERY_Z + 2.55;
  const projectsY = getTerrainHeight(5.22, wayfindZ);
  const awardsY = getTerrainHeight(-5.22, wayfindZ);

  const projectsDoor = galleryDoorX();
  const awardsDoor = awardsDoorX();
  const projectsSignY = getTerrainHeight(projectsDoor, GALLERY_Z) + GALLERY_DOOR_HEIGHT + 0.72;
  const awardsSignY = getTerrainHeight(awardsDoor, GALLERY_Z) + GALLERY_DOOR_HEIGHT + 0.72;

  return (
    <group>
      {BANNER_Z.map((z) =>
        ([-8.6, 8.6] as const).map((x) => {
          const y = getTerrainHeight(x, z);
          const clothX = x > 0 ? x - 0.4 : x + 0.4;
          return (
            <SignFixture
              key={`banner-${x}-${z}`}
              position={[clothX, y + 2.95, z]}
              intensity={i * 0.95}
              distance={5.2}
            />
          );
        }),
      )}

      <SignFixture position={[5.22, projectsY + 1.85, wayfindZ + 0.35]} intensity={i * 1.25} distance={6} />
      <SignFixture position={[-5.22, awardsY + 1.95, wayfindZ + 0.35]} intensity={i * 1.25} distance={6} />

      <SignFixture
        position={[projectsDoor - 0.55, projectsSignY, GALLERY_Z]}
        intensity={i * 1.4}
        distance={6.5}
      />
      <SignFixture
        position={[awardsDoor + 0.55, awardsSignY, GALLERY_Z]}
        intensity={i * 1.4}
        distance={6.5}
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
