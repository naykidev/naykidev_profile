import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { ShaderMaterial } from "three";
import { shoreXAt } from "./noise";
import { waterFragment, waterVertex } from "./shaders/water";

export function Water() {
  const mat = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame((_, dt) => {
    if (mat.current) mat.current.uniforms.uTime.value += dt;
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[62, -0.45, 0]}>
      <planeGeometry args={[130, 180, 40, 28]} />
      <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={waterVertex} fragmentShader={waterFragment} />
    </mesh>
  );
}

/** Thin stylized surf line along the cove — not a copied layout. */
export function Surf() {
  const pieces = useMemo(() => {
    const out: { x: number; z: number; r: number }[] = [];
    for (let z = -48; z <= 48; z += 3.2) {
      const x = shoreXAt(z) + 3.4;
      const nx = shoreXAt(z + 1.2) + 3.4;
      out.push({ x, z, r: Math.atan2(nx - x, 1.2) });
    }
    return out;
  }, []);

  return (
    <group>
      {pieces.map((p) => (
        <mesh key={p.z} position={[p.x, -0.22, p.z]} rotation={[0, p.r, 0]}>
          <boxGeometry args={[0.55, 0.08, 3.4]} />
          <meshLambertMaterial color="#f4f7fb" />
        </mesh>
      ))}
    </group>
  );
}
