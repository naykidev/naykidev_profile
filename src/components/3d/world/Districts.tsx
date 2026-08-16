import { getTerrainHeight } from "@/systems/terrain";
import {
  granite,
  limestone,
  plaster,
  roofCopper,
  sandstone,
  sandstoneDeep,
  timber,
} from "./materials";

function Facade({
  position,
  size,
  material = sandstone,
}: {
  position: [number, number, number];
  size: [number, number, number];
  material?: typeof sandstone;
}) {
  return (
    <mesh position={position} material={material} castShadow receiveShadow>
      <boxGeometry args={size} />
    </mesh>
  );
}

function footprintMinY(cx: number, cz: number, halfX: number, halfZ: number) {
  let min = Number.POSITIVE_INFINITY;
  for (let ix = -1; ix <= 1; ix += 1) {
    for (let iz = -1; iz <= 1; iz += 1) {
      min = Math.min(min, getTerrainHeight(cx + ix * halfX, cz + iz * halfZ));
    }
  }
  return min;
}

export function SurroundingBuildings() {
  const cx = 20;
  const cz = -16;
  const halfX = 5;
  const halfZ = 4;
  const bodyH = 6.4;
  const base = footprintMinY(cx, cz, halfX, halfZ) - 0.18;
  return (
    <group>
      <mesh position={[cx, base - 1.15, cz]} material={sandstoneDeep} castShadow receiveShadow>
        <boxGeometry args={[10.55, 2.5, 8.55]} />
      </mesh>
      <Facade position={[cx, base + bodyH / 2, cz]} size={[10, bodyH, 8]} />
      <mesh position={[cx, base + bodyH + 0.25, cz]} material={roofCopper} castShadow>
        <boxGeometry args={[10.6, 0.5, 8.6]} />
      </mesh>
    </group>
  );
}

export function AxolPavilion() {
  const y = getTerrainHeight(-18, 30);
  return (
    <group position={[-18, y, 30]}>
      <mesh position={[0, 0.2, 0]} material={limestone} receiveShadow>
        <cylinderGeometry args={[7.2, 7.2, 0.4, 20]} />
      </mesh>
      <mesh position={[0, 2.6, 0]} material={sandstone} castShadow receiveShadow>
        <cylinderGeometry args={[5.4, 5.8, 4.6, 16]} />
      </mesh>
      <mesh position={[0, 5.4, 0]} material={roofCopper} castShadow>
        <sphereGeometry args={[5.2, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2.4]} />
      </mesh>
      <mesh position={[0, 1.6, 5.5]} material={sandstoneDeep} castShadow>
        <boxGeometry args={[2.4, 3.2, 0.3]} />
      </mesh>
    </group>
  );
}

export function ProjectArcade() {
  const y = getTerrainHeight(28, 30);
  return (
    <group position={[28, y, 30]}>
      <Facade position={[0, 2.2, 0]} size={[11, 4.4, 7]} material={sandstoneDeep} />
      {[-3, 0, 3].map((x) => (
        <mesh key={x} position={[x, 1.3, 3.6]} material={granite} castShadow>
          <boxGeometry args={[1.6, 2.4, 1]} />
        </mesh>
      ))}
    </group>
  );
}

export function AchievementWing() {
  const y = getTerrainHeight(12, -30);
  return (
    <group position={[12, y, -30]}>
      <Facade position={[0, 2.5, 0]} size={[8, 5, 6]} />
      {[-1.6, 1.6].map((x) => (
        <mesh key={x} position={[x, 2.3, 3.15]} material={limestone} castShadow>
          <boxGeometry args={[1.4, 1.8, 0.12]} />
        </mesh>
      ))}
    </group>
  );
}

export function NextChapter() {
  const y = getTerrainHeight(0, 54);
  return (
    <group position={[0, y, 54]}>
      <mesh position={[0, 0.08, 0]} material={limestone} receiveShadow>
        <boxGeometry args={[5, 0.12, 16]} />
      </mesh>
      {[-1.6, 1.6].map((x) => (
        <mesh key={x} position={[x, 1.4, 4]} material={timber} castShadow>
          <boxGeometry args={[0.16, 2.8, 0.16]} />
        </mesh>
      ))}
      <mesh position={[0, 2.9, 4]} material={timber} castShadow>
        <boxGeometry args={[3.6, 0.14, 0.14]} />
      </mesh>
      <mesh position={[0, 2.2, 4.05]} material={plaster} castShadow>
        <boxGeometry args={[2.4, 0.7, 0.08]} />
      </mesh>
    </group>
  );
}

export function QuietCorner() {
  const y = getTerrainHeight(8, 40);
  return (
    <group position={[8, y, 40]}>
      <mesh position={[0, 0.55, 0]} material={timber} castShadow>
        <boxGeometry args={[0.18, 1.1, 0.12]} />
      </mesh>
      <mesh position={[0.35, 0.85, 0]} rotation={[0, 0, 0.5]} material={timber} castShadow>
        <boxGeometry args={[0.7, 0.12, 0.08]} />
      </mesh>
    </group>
  );
}

export function DistantWater() {
  return (
    <mesh position={[0, -0.4, 78]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[140, 40]} />
      <meshStandardMaterial
        color="#6d8ea3"
        roughness={0.12}
        metalness={0.35}
        emissive="#243848"
        emissiveIntensity={0.08}
      />
    </mesh>
  );
}
