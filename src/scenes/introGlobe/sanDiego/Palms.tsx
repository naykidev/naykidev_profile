import { useGLTF } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import { InstancedMesh, Mesh, Object3D } from "three";
import { coastHeight, hash2, shoreXAt } from "./noise";

const PALM_URL = "/models/san-diego-palm.glb";
const PALM_COUNT = 10;
const dummy = new Object3D();

export function Palms() {
  const { scene } = useGLTF(PALM_URL);
  const source = useMemo(() => {
    let found: Mesh | undefined;
    scene.traverse((object) => {
      if (found) return;
      if ((object as Mesh).isMesh) found = object as Mesh;
    });
    if (found) {
      found.castShadow = true;
      found.receiveShadow = true;
      found.geometry.computeBoundingBox();
    }
    return found;
  }, [scene]);
  const inst = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    const grove = inst.current;
    if (!grove || !source) return;
    const minY = source.geometry.boundingBox?.min.y ?? 0;
    let n = 0;
    for (let i = 0; n < PALM_COUNT && i < 80; i += 1) {
      const z = -16 + hash2(i, 2) * 32;
      const shore = shoreXAt(z);
      const x = shore - 1.45 - hash2(i, 3) * 1.7;
      if (x > shore - 1.2) continue;
      const s = 0.72 + hash2(i, 7) * 0.38;
      dummy.position.set(x, coastHeight(x, z) - minY * s - 0.28 * s, z);
      dummy.rotation.set(0, hash2(i, 4) * 6.28, 0);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      grove.setMatrixAt(n, dummy.matrix);
      n += 1;
    }
    grove.count = n;
    grove.instanceMatrix.needsUpdate = true;
  }, [source]);

  if (!source) return null;
  return (
    <instancedMesh
      ref={inst}
      args={[source.geometry, source.material, PALM_COUNT]}
      castShadow
      receiveShadow
      frustumCulled={false}
    />
  );
}

useGLTF.preload(PALM_URL);
