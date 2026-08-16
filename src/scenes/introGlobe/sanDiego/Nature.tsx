import { Clone, useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import type { Mesh, Object3D } from "three";
import { occupies } from "./townLayout";
import { coastHeight, hash2, shoreXAt } from "./noise";
import { asset } from "@/lib/asset";

const DRACO = true;

const URLS = {
  coconut: asset("/models/nature/coconut-palm.glb"),
  royal: asset("/models/nature/royal-palm.glb"),
  date: asset("/models/nature/date-palm.glb"),
  bush: asset("/models/nature/bush-round-01.glb"),
  hedge: asset("/models/nature/boxwood-hedge.glb"),
  scrub: asset("/models/nature/desert-scrub.glb"),
  dune: asset("/models/nature/dune-grass-tuft.glb"),
  flowering: asset("/models/nature/flowering-tree.glb"),
  shade: asset("/models/nature/shade-tree.glb"),
  street: asset("/models/nature/street-tree-01.glb"),
  boulder: asset("/models/nature/sandstone-boulder.glb"),
  moss: asset("/models/nature/mossy-boulder.glb"),
  driftwood: asset("/models/nature/driftwood-snag.glb"),
  grass: asset("/models/nature/grass-tuft-scatter.glb"),
  lawn: asset("/models/nature/lawn-tuft-scatter.glb"),
  flowers: asset("/models/nature/flower-bed.glb"),
  shrub: asset("/models/nature/lineside-shrub.glb"),
  cattail: asset("/models/nature/cattail-reed-clump.glb"),
} as const;

type Lot = { x: number; z: number; rot: number; scale: number };

function plant(x: number, z: number) {
  return coastHeight(x, z) - 0.04;
}

function scatter(opts: {
  count: number;
  seed: number;
  minXFromShore: number;
  maxXFromShore: number;
  zMin?: number;
  zMax?: number;
  scale: [number, number];
  minGap?: number;
  inlandOnly?: boolean;
}): Lot[] {
  const lots: Lot[] = [];
  const zMin = opts.zMin ?? -18;
  const zSpan = (opts.zMax ?? 18) - zMin;
  for (let i = 0; lots.length < opts.count && i < opts.count * 14; i += 1) {
    const z = zMin + hash2(i, opts.seed) * zSpan;
    const shore = shoreXAt(z);
    const x = shore - opts.minXFromShore - hash2(i, opts.seed + 1) * (opts.maxXFromShore - opts.minXFromShore);
    if (opts.inlandOnly && x > shore - 1.2) continue;
    if (x < -38) continue;
    if (occupies(x, z)) continue;
    const gap = opts.minGap ?? 0;
    if (gap > 0 && lots.some((lot) => Math.hypot(lot.x - x, lot.z - z) < gap)) continue;
    lots.push({
      x,
      z,
      rot: hash2(i, opts.seed + 4) * Math.PI * 2,
      scale: opts.scale[0] + hash2(i, opts.seed + 7) * (opts.scale[1] - opts.scale[0]),
    });
  }
  return lots;
}

function Packed({ url, lots }: { url: string; lots: Lot[] }) {
  const { scene } = useGLTF(url, DRACO);
  useMemo(() => {
    scene.traverse((object: Object3D) => {
      const mesh = object as Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [scene]);

  return (
    <group>
      {lots.map((lot) => (
        <group
          key={`${url}-${lot.x.toFixed(2)}-${lot.z.toFixed(2)}`}
          position={[lot.x, plant(lot.x, lot.z), lot.z]}
          rotation={[0, lot.rot, 0]}
          scale={lot.scale}
        >
          <Clone object={scene} castShadow receiveShadow />
        </group>
      ))}
    </group>
  );
}

export function Nature() {
  const coconut = useMemo(
    () =>
      scatter({
        count: 9,
        seed: 41,
        minXFromShore: 1.6,
        maxXFromShore: 4.2,
        scale: [0.42, 0.62],
        minGap: 4.8,
      }),
    [],
  );
  const royal = useMemo(
    () =>
      scatter({
        count: 4,
        seed: 52,
        minXFromShore: 2.2,
        maxXFromShore: 4.4,
        scale: [0.38, 0.55],
        minGap: 6.2,
        inlandOnly: true,
      }),
    [],
  );
  const date = useMemo(
    () =>
      scatter({
        count: 3,
        seed: 63,
        minXFromShore: 2.4,
        maxXFromShore: 4.8,
        scale: [0.36, 0.5],
        minGap: 6.5,
        inlandOnly: true,
      }),
    [],
  );
  const shade = useMemo(
    () =>
      scatter({
        count: 4,
        seed: 74,
        minXFromShore: 14,
        maxXFromShore: 22,
        scale: [0.32, 0.48],
        minGap: 5.4,
        inlandOnly: true,
      }),
    [],
  );
  const flowering = useMemo(
    () =>
      scatter({
        count: 3,
        seed: 85,
        minXFromShore: 15,
        maxXFromShore: 24,
        scale: [0.3, 0.44],
        minGap: 5,
        inlandOnly: true,
      }),
    [],
  );
  const street = useMemo(
    () =>
      scatter({
        count: 3,
        seed: 96,
        minXFromShore: 16,
        maxXFromShore: 24,
        scale: [0.28, 0.4],
        minGap: 5.8,
        inlandOnly: true,
      }),
    [],
  );
  const bushes = useMemo(
    () =>
      scatter({
        count: 18,
        seed: 11,
        minXFromShore: 1.8,
        maxXFromShore: 4.6,
        scale: [0.55, 0.95],
        minGap: 2.1,
        inlandOnly: true,
      }),
    [],
  );
  const shrubs = useMemo(
    () =>
      scatter({
        count: 16,
        seed: 21,
        minXFromShore: 1.5,
        maxXFromShore: 4.2,
        scale: [0.45, 0.8],
        minGap: 1.8,
      }),
    [],
  );
  const scrub = useMemo(
    () =>
      scatter({
        count: 18,
        seed: 31,
        minXFromShore: 1.2,
        maxXFromShore: 3.8,
        scale: [0.5, 0.9],
        minGap: 1.6,
      }),
    [],
  );
  const hedges = useMemo(
    () =>
      scatter({
        count: 4,
        seed: 107,
        minXFromShore: 16,
        maxXFromShore: 24,
        scale: [0.28, 0.4],
        minGap: 4.4,
        inlandOnly: true,
      }),
    [],
  );
  const flowerBeds = useMemo(
    () =>
      scatter({
        count: 4,
        seed: 118,
        minXFromShore: 16,
        maxXFromShore: 24,
        scale: [0.32, 0.48],
        minGap: 3.6,
        inlandOnly: true,
      }),
    [],
  );
  const dune = useMemo(
    () =>
      scatter({
        count: 70,
        seed: 33,
        minXFromShore: 0.15,
        maxXFromShore: 2.4,
        scale: [0.55, 1.05],
        minGap: 0.85,
      }),
    [],
  );
  const grass = useMemo(
    () =>
      scatter({
        count: 28,
        seed: 44,
        minXFromShore: 1.4,
        maxXFromShore: 4,
        scale: [0.45, 0.85],
        minGap: 1.15,
      }),
    [],
  );
  const lawn = useMemo(
    () =>
      scatter({
        count: 14,
        seed: 55,
        minXFromShore: 16,
        maxXFromShore: 26,
        scale: [0.4, 0.75],
        minGap: 1.4,
        inlandOnly: true,
      }),
    [],
  );
  const boulders = useMemo(
    () =>
      scatter({
        count: 14,
        seed: 129,
        minXFromShore: -0.2,
        maxXFromShore: 2.2,
        scale: [0.45, 0.85],
        minGap: 2.8,
      }),
    [],
  );
  const moss = useMemo(
    () =>
      scatter({
        count: 6,
        seed: 140,
        minXFromShore: 1.6,
        maxXFromShore: 3.6,
        scale: [0.4, 0.7],
        minGap: 3.2,
      }),
    [],
  );
  const driftwood = useMemo(
    () =>
      scatter({
        count: 7,
        seed: 151,
        minXFromShore: -0.4,
        maxXFromShore: 1.6,
        scale: [0.5, 0.85],
        minGap: 4.5,
      }),
    [],
  );
  const cattails = useMemo(
    () =>
      scatter({
        count: 12,
        seed: 162,
        minXFromShore: -0.6,
        maxXFromShore: 1.1,
        zMin: -8,
        zMax: 14,
        scale: [0.45, 0.75],
        minGap: 2.2,
      }),
    [],
  );

  return (
    <group>
      <Packed url={URLS.coconut} lots={coconut} />
      <Packed url={URLS.royal} lots={royal} />
      <Packed url={URLS.date} lots={date} />
      <Packed url={URLS.shade} lots={shade} />
      <Packed url={URLS.flowering} lots={flowering} />
      <Packed url={URLS.street} lots={street} />
      <Packed url={URLS.bush} lots={bushes} />
      <Packed url={URLS.shrub} lots={shrubs} />
      <Packed url={URLS.scrub} lots={scrub} />
      <Packed url={URLS.hedge} lots={hedges} />
      <Packed url={URLS.flowers} lots={flowerBeds} />
      <Packed url={URLS.dune} lots={dune} />
      <Packed url={URLS.grass} lots={grass} />
      <Packed url={URLS.lawn} lots={lawn} />
      <Packed url={URLS.boulder} lots={boulders} />
      <Packed url={URLS.moss} lots={moss} />
      <Packed url={URLS.driftwood} lots={driftwood} />
      <Packed url={URLS.cattail} lots={cattails} />
    </group>
  );
}

for (const url of Object.values(URLS)) {
  useGLTF.preload(url, DRACO);
}
