import { useGLTF } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import { InstancedMesh, Mesh, Object3D } from "three";
import { coastHeight } from "./noise";
import { coastTown, neighborhoodDeck, onPavement, type Pose } from "./townLayout";
import { asset } from "@/lib/asset";

const DRACO = true;

const URLS = {
  bungalow: asset("/models/neighborhood/bungalow-house.glb"),
  cottage: asset("/models/neighborhood/home-cottage-01.glb"),
  ranch: asset("/models/neighborhood/ranch-house.glb"),
  twoStory: asset("/models/neighborhood/two-story-house.glb"),
  garage: asset("/models/neighborhood/garage.glb"),
  shed: asset("/models/neighborhood/garden-shed.glb"),
  fence: asset("/models/neighborhood/picket-fence.glb"),
  privacy: asset("/models/neighborhood/privacy-fence.glb"),
  mail: asset("/models/neighborhood/mailbox.glb"),
  lamp: asset("/models/neighborhood/deco-street-lamp.glb"),
  family: asset("/models/neighborhood/family-sedan.glb"),
  sedan: asset("/models/neighborhood/sedan-01.glb"),
  bush: asset("/models/nature/bush-round-01.glb"),
  flowers: asset("/models/nature/flower-bed.glb"),
  lawn: asset("/models/nature/lawn-tuft-scatter.glb"),
} as const;

const dummy = new Object3D();

function localMinY(mesh: Mesh) {
  mesh.geometry.computeBoundingBox();
  return mesh.geometry.boundingBox?.min.y ?? 0;
}

function sampleHeight(x: number, z: number) {
  const road = onPavement(x, z);
  const h = coastHeight(x, z);
  if (road <= 0.02) return h;
  return h * (1 - road * 0.94) + neighborhoodDeck(x) * (road * 0.94);
}

function groundY(x: number, z: number, pad = 0.85) {
  return (
    (sampleHeight(x, z) +
      sampleHeight(x + pad, z) +
      sampleHeight(x - pad, z) +
      sampleHeight(x, z + pad) +
      sampleHeight(x, z - pad)) /
      5 -
    0.04
  );
}

function InstancedPack({ url, lots, sink = 0 }: { url: string; lots: Pose[]; sink?: number }) {
  const { scene } = useGLTF(url, DRACO);
  const source = useMemo(() => {
    let found: Mesh | undefined;
    scene.traverse((object) => {
      if (found) return;
      if ((object as Mesh).isMesh) found = object as Mesh;
    });
    if (found) {
      found.castShadow = true;
      found.receiveShadow = true;
    }
    return found;
  }, [scene]);
  const minY = useMemo(() => {
    if (!source) return 0;
    return localMinY(source);
  }, [source]);
  const inst = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = inst.current;
    if (!mesh || !source) return;
    lots.forEach((lot, i) => {
      dummy.position.set(lot.x, groundY(lot.x, lot.z) - minY * lot.scale - sink * lot.scale, lot.z);
      dummy.rotation.set(0, lot.rot, 0);
      dummy.scale.setScalar(lot.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.count = lots.length;
    mesh.instanceMatrix.needsUpdate = true;
  }, [lots, minY, sink, source]);

  if (!source || lots.length === 0) return null;
  const material = Array.isArray(source.material) ? source.material[0] : source.material;
  return (
    <instancedMesh
      ref={inst}
      args={[source.geometry, material, lots.length]}
      castShadow
      receiveShadow
      frustumCulled={false}
    />
  );
}

function groupByKind(lots: Pose[]) {
  const groups: Record<string, Pose[]> = {};
  for (const lot of lots) {
    (groups[lot.kind] ??= []).push(lot);
  }
  return groups;
}

export function CoastTown() {
  const { houses, garages, sheds, fences, mailboxes, lamps, cars, yards } = coastTown;
  const housesByKind = useMemo(() => groupByKind(houses), [houses]);
  const yardsByKind = useMemo(() => groupByKind(yards), [yards]);
  const carsByKind = useMemo(() => groupByKind(cars), [cars]);
  const fencesByKind = useMemo(() => groupByKind(fences), [fences]);

  return (
    <group>
      <InstancedPack url={URLS.bungalow} lots={housesByKind.bungalow ?? []} sink={0.05} />
      <InstancedPack url={URLS.cottage} lots={housesByKind.cottage ?? []} sink={0.05} />
      <InstancedPack url={URLS.ranch} lots={housesByKind.ranch ?? []} sink={0.05} />
      <InstancedPack url={URLS.twoStory} lots={housesByKind.twoStory ?? []} sink={0.05} />
      <InstancedPack url={URLS.garage} lots={garages} sink={0.05} />
      <InstancedPack url={URLS.shed} lots={sheds} sink={0.05} />
      <InstancedPack url={URLS.fence} lots={fencesByKind.fence ?? []} sink={0.03} />
      <InstancedPack url={URLS.privacy} lots={fencesByKind.privacy ?? []} sink={0.03} />
      <InstancedPack url={URLS.mail} lots={mailboxes} sink={0.02} />
      <InstancedPack url={URLS.lamp} lots={lamps} sink={0.04} />
      <InstancedPack url={URLS.family} lots={carsByKind.family ?? []} sink={0.02} />
      <InstancedPack url={URLS.sedan} lots={carsByKind.sedan ?? []} sink={0.02} />
      <InstancedPack url={URLS.bush} lots={yardsByKind.bush ?? []} sink={0.04} />
      <InstancedPack url={URLS.flowers} lots={yardsByKind.flowers ?? []} sink={0.04} />
      <InstancedPack url={URLS.lawn} lots={yardsByKind.lawn ?? []} sink={0.04} />
    </group>
  );
}

for (const url of [...new Set(Object.values(URLS))]) {
  useGLTF.preload(url, DRACO);
}
