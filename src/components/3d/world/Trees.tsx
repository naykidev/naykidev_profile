import { useLayoutEffect, useRef } from "react";
import { InstancedMesh, Object3D } from "three";
import { galleryApproachContains, galleryFootprintContains } from "@/systems/campusLayout";
import { getTerrainHeight } from "@/systems/terrain";
import { foliage, foliageDark, timber } from "./materials";

const dummy = new Object3D();

const TREE_SPOTS: [number, number][] = [
  [-11.2, 10],
  [9.6, 8.2],
  [-12.6, 0.5],
  [12.8, 0.2],
  [-11.8, 18],
  [9.2, 22.4],
  [-13.2, 26],
  [10.4, 29.2],
  [-12.4, 34],
  [12.6, 33],
  [-11.5, 42],
  [11.8, 41],
  [-24, -6],
  [24.5, -7],
  [-27, 8],
  [28, 9],
  [-26, 20],
  [27, 21],
  [-23, -20],
  [23.5, -19],
].filter(
  (spot): spot is [number, number] =>
    !galleryFootprintContains(spot[0], spot[1], 5) && !galleryApproachContains(spot[0], spot[1]),
);

export function TreeField() {
  const trunks = useRef<InstancedMesh>(null);
  const canopyA = useRef<InstancedMesh>(null);
  const canopyB = useRef<InstancedMesh>(null);
  const aCount = Math.ceil(TREE_SPOTS.length / 2);
  const bCount = Math.floor(TREE_SPOTS.length / 2);

  useLayoutEffect(() => {
    let ai = 0;
    let bi = 0;
    TREE_SPOTS.forEach(([x, z], i) => {
      const scale = 0.85 + (i % 5) * 0.08;
      const y = getTerrainHeight(x, z);
      dummy.position.set(x, y + 1.15 * scale, z);
      dummy.scale.set(scale, 2.3 * scale, scale);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      trunks.current?.setMatrixAt(i, dummy.matrix);

      dummy.position.set(x, y + 3.5 * scale, z);
      dummy.scale.set(2.4 * scale, 2.6 * scale, 2.4 * scale);
      dummy.rotation.set(0, i, 0);
      dummy.updateMatrix();
      if (i % 2 === 0) {
        canopyA.current?.setMatrixAt(ai, dummy.matrix);
        ai += 1;
      } else {
        canopyB.current?.setMatrixAt(bi, dummy.matrix);
        bi += 1;
      }
    });
    if (trunks.current) trunks.current.instanceMatrix.needsUpdate = true;
    if (canopyA.current) canopyA.current.instanceMatrix.needsUpdate = true;
    if (canopyB.current) canopyB.current.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <group>
      <instancedMesh ref={trunks} args={[undefined, timber, TREE_SPOTS.length]} castShadow>
        <cylinderGeometry args={[0.18, 0.28, 1, 6]} />
      </instancedMesh>
      <instancedMesh ref={canopyA} args={[undefined, foliage, aCount]} castShadow>
        <icosahedronGeometry args={[1, 1]} />
      </instancedMesh>
      <instancedMesh ref={canopyB} args={[undefined, foliageDark, bCount]} castShadow>
        <icosahedronGeometry args={[1, 1]} />
      </instancedMesh>
    </group>
  );
}
