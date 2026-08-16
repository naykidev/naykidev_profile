import { HALL_Y, HALL_Z, TERRACE_SURFACE } from "@/systems/campusLayout";
import { useTexture } from "@react-three/drei";
import { BufferAttribute, BufferGeometry, DoubleSide, InstancedMesh, Object3D, SRGBColorSpace } from "three";
import { useLayoutEffect, useRef, Suspense } from "react";
import {
  creamStone,
  glass,
  sandstone,
  sandstoneDeep,
  slateRoof,
  windowFrame,
} from "./materials";
import { entablatureMap, flagMap } from "./textures";
import { asset } from "@/lib/asset";

const dummy = new Object3D();
const BODY_Y = 0;

function IonicColumn({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh material={creamStone} castShadow>
        <boxGeometry args={[0.62, 0.28, 0.62]} />
      </mesh>
      <mesh position={[0, 3.55, 0]} material={creamStone} castShadow>
        <cylinderGeometry args={[0.22, 0.28, 6.9, 16]} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.24, 3.55, Math.sin(a) * 0.24]}
            material={creamStone}
            castShadow
          >
            <boxGeometry args={[0.04, 6.85, 0.04]} />
          </mesh>
        );
      })}
      <mesh position={[0, 7.12, 0]} material={creamStone} castShadow>
        <boxGeometry args={[0.7, 0.16, 0.7]} />
      </mesh>
      <mesh position={[-0.16, 7.28, 0]} rotation={[Math.PI / 2, 0, 0]} material={creamStone}>
        <torusGeometry args={[0.12, 0.06, 8, 12]} />
      </mesh>
      <mesh position={[0.16, 7.28, 0]} rotation={[Math.PI / 2, 0, 0]} material={creamStone}>
        <torusGeometry args={[0.12, 0.06, 8, 12]} />
      </mesh>
    </group>
  );
}

function triangleGeom(width: number, height: number) {
  const geometry = new BufferGeometry();
  const hw = width / 2;
  geometry.setAttribute(
    "position",
    new BufferAttribute(
      new Float32Array([-hw, 0, 0, hw, 0, 0, 0, height, 0]),
      3,
    ),
  );
  geometry.setIndex([0, 1, 2]);
  geometry.computeVertexNormals();
  return geometry;
}

function Pediment({ position }: { position: [number, number, number] }) {
  const face = triangleGeom(11.2, 2.15);
  const trim = triangleGeom(11.7, 2.38);
  return (
    <group position={position}>
      <mesh geometry={trim} position={[0, -0.04, -0.05]} material={creamStone} castShadow />
      <mesh geometry={face} castShadow>
        <meshStandardMaterial color="#f4eee3" roughness={0.4} metalness={0.03} side={DoubleSide} />
      </mesh>
    </group>
  );
}

function usePunchedDoorMap(src: string) {
  const map = useTexture(src);
  useLayoutEffect(() => {
    if (map.userData.punched) return;
    const img = map.image as HTMLImageElement | HTMLCanvasElement | undefined;
    if (!img) return;
    const source = document.createElement("canvas");
    source.width = img.width;
    source.height = img.height;
    const ctx = source.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, 0, 0);
    const pixels = ctx.getImageData(0, 0, source.width, source.height);
    for (let i = 0; i < pixels.data.length; i += 4) {
      if (pixels.data[i] > 248 && pixels.data[i + 1] > 248 && pixels.data[i + 2] > 248) {
        pixels.data[i + 3] = 0;
      }
    }
    ctx.putImageData(pixels, 0, 0);
    map.image = source;
    map.colorSpace = SRGBColorSpace;
    map.anisotropy = 8;
    map.needsUpdate = true;
    map.userData.punched = true;
  }, [map]);
  return map;
}

function BascomDoorPair() {
  const leftMap = usePunchedDoorMap(asset("/textures/gallery-door-left.png"));
  const rightMap = usePunchedDoorMap(asset("/textures/gallery-door-right.png"));
  const leafW = 0.86;
  const leafH = 2.18;
  return (
    <group position={[0, 1.12, 0.08]}>
      <mesh position={[-leafW / 2, 0, 0]} castShadow>
        <planeGeometry args={[leafW, leafH]} />
        <meshStandardMaterial
          map={leftMap}
          roughness={0.78}
          metalness={0}
          transparent
          alphaTest={0.12}
          envMapIntensity={0}
        />
      </mesh>
      <mesh position={[leafW / 2, 0, 0]} castShadow>
        <planeGeometry args={[leafW, leafH]} />
        <meshStandardMaterial
          map={rightMap}
          roughness={0.78}
          metalness={0}
          transparent
          alphaTest={0.12}
          envMapIntensity={0}
        />
      </mesh>
    </group>
  );
}

function TripleArch({ position }: { position: [number, number, number] }) {
  const xs = [-2.55, 0, 2.55];
  return (
    <group position={position}>
      <mesh position={[0, 2.15, 0]} material={sandstone} castShadow receiveShadow>
        <boxGeometry args={[11.2, 4.3, 0.55]} />
      </mesh>
      {xs.map((x) => (
        <group key={x} position={[x, 0, 0.22]}>
          <mesh position={[0, 1.15, -0.18]} material={sandstoneDeep} receiveShadow>
            <boxGeometry args={[1.85, 2.3, 0.42]} />
          </mesh>
          <Suspense fallback={null}>
            <BascomDoorPair />
          </Suspense>
          <mesh
            position={[0, 2.28, 0.12]}
            rotation={[Math.PI / 2, 0, 0]}
            material={creamStone}
            castShadow
          >
            <torusGeometry args={[0.95, 0.12, 8, 20, Math.PI]} />
          </mesh>
          <mesh position={[-0.95, 1.14, 0.12]} material={creamStone} castShadow>
            <boxGeometry args={[0.16, 2.28, 0.16]} />
          </mesh>
          <mesh position={[0.95, 1.14, 0.12]} material={creamStone} castShadow>
            <boxGeometry args={[0.16, 2.28, 0.16]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function WindowGrid({
  originX,
  originY,
  cols,
  rows,
  colSpacing,
  rowSpacing,
  z,
}: {
  originX: number;
  originY: number;
  cols: number;
  rows: number;
  colSpacing: number;
  rowSpacing: number;
  z: number;
}) {
  const frames = useRef<InstancedMesh>(null);
  const panes = useRef<InstancedMesh>(null);
  const bars = useRef<InstancedMesh>(null);
  const count = cols * rows;

  useLayoutEffect(() => {
    let i = 0;
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const x = originX + c * colSpacing;
        const y = originY + r * rowSpacing;
        dummy.position.set(x, y, z);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        frames.current?.setMatrixAt(i, dummy.matrix);
        dummy.position.set(x, y, z + 0.03);
        dummy.updateMatrix();
        panes.current?.setMatrixAt(i, dummy.matrix);
        dummy.position.set(x, y, z + 0.05);
        dummy.updateMatrix();
        bars.current?.setMatrixAt(i, dummy.matrix);
        i += 1;
      }
    }
    if (frames.current) frames.current.instanceMatrix.needsUpdate = true;
    if (panes.current) panes.current.instanceMatrix.needsUpdate = true;
    if (bars.current) bars.current.instanceMatrix.needsUpdate = true;
  }, [originX, originY, cols, rows, colSpacing, rowSpacing, z]);

  return (
    <group>
      <instancedMesh ref={frames} args={[undefined, windowFrame, count]} castShadow>
        <boxGeometry args={[0.78, 1.18, 0.08]} />
      </instancedMesh>
      <instancedMesh ref={panes} args={[undefined, glass, count]}>
        <boxGeometry args={[0.62, 1.02, 0.04]} />
      </instancedMesh>
      <instancedMesh ref={bars} args={[undefined, windowFrame, count]}>
        <boxGeometry args={[0.05, 1.0, 0.03]} />
      </instancedMesh>
    </group>
  );
}

function HippedRoof() {
  const mainY = BODY_Y + 8.92;
  const wingY = BODY_Y + 7.48;
  return (
    <group>
      <mesh position={[0, mainY + 0.22, -0.6]} rotation={[0.1, 0, 0]} material={slateRoof} castShadow>
        <boxGeometry args={[22.6, 0.16, 10.4]} />
      </mesh>
      <mesh position={[0, mainY + 0.08, -4.6]} rotation={[-0.12, 0, 0]} material={slateRoof} castShadow>
        <boxGeometry args={[22.4, 0.14, 4.6]} />
      </mesh>
      <mesh position={[-14.6, wingY, 0.15]} rotation={[0.08, 0, 0]} material={slateRoof} castShadow>
        <boxGeometry args={[7.7, 0.14, 10.2]} />
      </mesh>
      <mesh position={[14.6, wingY, 0.15]} rotation={[0.08, 0, 0]} material={slateRoof} castShadow>
        <boxGeometry args={[7.7, 0.14, 10.2]} />
      </mesh>
    </group>
  );
}

function Flagpole() {
  const y = BODY_Y + 9.35;
  return (
    <group position={[0, y, -0.8]}>
      <mesh position={[0, 2.15, 0]} material={windowFrame} castShadow>
        <cylinderGeometry args={[0.04, 0.065, 4.3, 8]} />
      </mesh>
      <mesh position={[0.95, 3.95, 0]}>
        <planeGeometry args={[1.9, 1.1]} />
        <meshStandardMaterial map={flagMap} roughness={0.55} metalness={0.05} side={DoubleSide} />
      </mesh>
    </group>
  );
}

function PorticoBalustrade() {
  const posts = useRef<InstancedMesh>(null);
  const floorY = 2.64;
  const railZ = 8.48;
  const x0 = -4.62;
  const x1 = 4.62;
  const count = 31;

  useLayoutEffect(() => {
    for (let i = 0; i < count; i += 1) {
      const x = x0 + ((x1 - x0) * i) / (count - 1);
      dummy.position.set(x, floorY + 0.34, railZ);
      dummy.scale.set(1, 1, 1);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      posts.current?.setMatrixAt(i, dummy.matrix);
    }
    if (posts.current) posts.current.instanceMatrix.needsUpdate = true;
  }, []);

  const newels = [-4.65, -1.55, 1.55, 4.65];

  return (
    <group>
      <mesh position={[0, floorY, 7.42]} material={creamStone} receiveShadow>
        <boxGeometry args={[9.5, 0.1, 2.15]} />
      </mesh>
      <mesh position={[0, floorY + 0.08, railZ]} material={creamStone} castShadow>
        <boxGeometry args={[9.4, 0.07, 0.16]} />
      </mesh>
      <mesh position={[0, floorY + 0.68, railZ]} material={creamStone} castShadow>
        <boxGeometry args={[9.45, 0.1, 0.18]} />
      </mesh>
      <instancedMesh ref={posts} args={[undefined, creamStone, count]} castShadow>
        <boxGeometry args={[0.09, 0.56, 0.09]} />
      </instancedMesh>
      {newels.map((x) => (
        <mesh
          key={x}
          position={[x, floorY + 0.4, railZ]}
          material={creamStone}
          castShadow
        >
          <boxGeometry args={[0.16, 0.8, 0.16]} />
        </mesh>
      ))}
    </group>
  );
}

function BuckyBanner() {
  const map = useTexture(asset("/textures/bucky-banner.png"));
  map.colorSpace = SRGBColorSpace;
  map.anisotropy = 8;
  const width = 8.15;
  const height = width * (419 / 707);
  return (
    <mesh position={[0, BODY_Y + 4.95, 6.62]} receiveShadow>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial map={map} roughness={0.58} metalness={0.02} />
    </mesh>
  );
}

export function BascomHall() {
  const columns: [number, number, number][] = [
    [-4.65, TERRACE_SURFACE, 8.55],
    [-1.55, TERRACE_SURFACE, 8.55],
    [1.55, TERRACE_SURFACE, 8.55],
    [4.65, TERRACE_SURFACE, 8.55],
  ];

  return (
    <group position={[0, HALL_Y, HALL_Z]}>
      <mesh position={[0, -2.15, 0.4]} material={sandstoneDeep} receiveShadow>
        <boxGeometry args={[23.4, 4.4, 14.2]} />
      </mesh>
      <mesh position={[-14.6, -2.15, 0.35]} material={sandstoneDeep} receiveShadow>
        <boxGeometry args={[8.2, 4.4, 11.2]} />
      </mesh>
      <mesh position={[14.6, -2.15, 0.35]} material={sandstoneDeep} receiveShadow>
        <boxGeometry args={[8.2, 4.4, 11.2]} />
      </mesh>
      <mesh position={[0, -2.05, 9.6]} material={sandstoneDeep} receiveShadow>
        <boxGeometry args={[15.4, 4.2, 8.6]} />
      </mesh>
      <mesh position={[0, BODY_Y + 4.35, 0]} material={sandstone} castShadow receiveShadow>
        <boxGeometry args={[22.4, 8.7, 12.2]} />
      </mesh>
      <mesh
        position={[-14.6, BODY_Y + 3.7, 0.35]}
        material={sandstoneDeep}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[7.6, 7.4, 10.4]} />
      </mesh>
      <mesh
        position={[14.6, BODY_Y + 3.7, 0.35]}
        material={sandstoneDeep}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[7.6, 7.4, 10.4]} />
      </mesh>
      <mesh position={[0, BODY_Y + 8.85, -0.4]} material={creamStone} castShadow>
        <boxGeometry args={[22.8, 0.28, 11.4]} />
      </mesh>
      {Array.from({ length: 13 }, (_, i) => (
        <mesh
          key={`baluster-${i}`}
          position={[-9 + i * 1.5, BODY_Y + 9.15, 5.85]}
          material={creamStone}
          castShadow
        >
          <boxGeometry args={[0.12, 0.4, 0.12]} />
        </mesh>
      ))}

      <mesh position={[0, BODY_Y + 7.28, 7.35]} material={creamStone} castShadow receiveShadow>
        <boxGeometry args={[11.6, 0.16, 2.4]} />
      </mesh>
      <mesh position={[0, BODY_Y + 7.48, 8.55]} material={creamStone} castShadow receiveShadow>
        <boxGeometry args={[11.5, 0.4, 1.25]} />
      </mesh>
      <mesh position={[0, BODY_Y + 7.72, 8.55]} material={creamStone} castShadow>
        <boxGeometry args={[11.7, 0.14, 1.35]} />
      </mesh>
      <mesh position={[0, BODY_Y + 7.48, 9.22]} rotation={[-0.12, 0, 0]}>
        <planeGeometry args={[10.6, 0.38]} />
        <meshStandardMaterial map={entablatureMap} roughness={0.45} metalness={0.04} />
      </mesh>

      {columns.map((pos) => (
        <IonicColumn key={pos[0]} position={pos} />
      ))}
      <Pediment position={[0, BODY_Y + 7.8, 8.55]} />
      <TripleArch position={[0, TERRACE_SURFACE, 6.28]} />
      <PorticoBalustrade />

      <Suspense fallback={null}>
        <BuckyBanner />
      </Suspense>

      <mesh position={[0, TERRACE_SURFACE * 0.5, 9.45]} material={creamStone} receiveShadow>
        <boxGeometry args={[14.8, TERRACE_SURFACE, 7.2]} />
      </mesh>
      <mesh position={[0, TERRACE_SURFACE + 0.04, 10.55]} material={creamStone} receiveShadow>
        <boxGeometry args={[13.4, 0.08, 4.4]} />
      </mesh>

      <WindowGrid
        originX={-10.35}
        originY={BODY_Y + 2.15}
        cols={3}
        rows={3}
        colSpacing={1.45}
        rowSpacing={1.85}
        z={6.18}
      />
      <WindowGrid
        originX={7.45}
        originY={BODY_Y + 2.15}
        cols={3}
        rows={3}
        colSpacing={1.45}
        rowSpacing={1.85}
        z={6.18}
      />
      <WindowGrid
        originX={-17.2}
        originY={BODY_Y + 1.85}
        cols={4}
        rows={3}
        colSpacing={1.55}
        rowSpacing={1.75}
        z={5.6}
      />
      <WindowGrid
        originX={12.55}
        originY={BODY_Y + 1.85}
        cols={4}
        rows={3}
        colSpacing={1.55}
        rowSpacing={1.75}
        z={5.6}
      />

      <HippedRoof />
      <Flagpole />
    </group>
  );
}
