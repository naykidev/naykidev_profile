import { Suspense, useLayoutEffect } from "react";
import { useGLTF } from "@react-three/drei";
import type { Mesh, Object3D } from "three";
import { LINCOLN_Z, TERRACE_Y } from "@/systems/campusLayout";
import { bronze, granite, limestone } from "./materials";
import { asset } from "@/lib/asset";

const LINCOLN_URL = asset("/models/lincoln.glb");
const STATUE_SCALE = 2.55;
const PEDESTAL_TOP = 1.29;
const STATUE_SINK = 0.42;

function LincolnStatue() {
  const { scene } = useGLTF(LINCOLN_URL, true);

  useLayoutEffect(() => {
    scene.traverse((object: Object3D) => {
      const mesh = object as Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [scene]);

  return (
    <primitive
      object={scene}
      position={[0, PEDESTAL_TOP + 0.5 * STATUE_SCALE - STATUE_SINK, 0.12]}
      rotation={[0, 0, 0]}
      scale={STATUE_SCALE}
    />
  );
}

function BronzeFallback() {
  return (
    <group position={[0, 1.7, 0.1]}>
      <mesh position={[0, 0.55, -0.22]} material={bronze} castShadow>
        <boxGeometry args={[0.9, 1.1, 0.2]} />
      </mesh>
      <mesh position={[0, 0.78, 0.06]} material={bronze} castShadow>
        <capsuleGeometry args={[0.32, 0.5, 5, 10]} />
      </mesh>
      <mesh position={[0, 1.38, 0.1]} material={bronze} castShadow>
        <sphereGeometry args={[0.22, 14, 12]} />
      </mesh>
    </group>
  );
}

export function LincolnMonument() {
  return (
    <group position={[0, TERRACE_Y, LINCOLN_Z]}>
      <group>
        <mesh position={[0, 0.1, 0.2]} material={limestone} receiveShadow>
          <boxGeometry args={[3.4, 0.2, 2.6]} />
        </mesh>
        <mesh position={[0, 0.38, 0.08]} material={granite} castShadow receiveShadow>
          <boxGeometry args={[2.15, 0.36, 1.7]} />
        </mesh>
        <mesh position={[0, 0.92, 0.06]} material={granite} castShadow>
          <boxGeometry args={[1.45, 0.74, 1.18]} />
        </mesh>
        <mesh position={[0, PEDESTAL_TOP - 0.12, 0.08]} material={bronze} castShadow>
          <boxGeometry args={[1.12, 0.38, 0.95]} />
        </mesh>
        <Suspense fallback={<BronzeFallback />}>
          <LincolnStatue />
        </Suspense>
      </group>
      {Array.from({ length: 13 }, (_, i) => {
        const t = (i / 12) * Math.PI;
        const x = Math.cos(t) * 3.7;
        const zz = Math.sin(t) * 1.7 - 0.15;
        return (
          <mesh
            key={i}
            position={[x, 0.16, zz]}
            material={limestone}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[0.5, 0.32, 0.36]} />
          </mesh>
        );
      })}
    </group>
  );
}

useGLTF.preload(LINCOLN_URL, true);
