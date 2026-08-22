import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { ShaderMaterial } from "three";
import { waterFragment, waterVertex } from "./shaders/water";

/** Large continuous stylized Pacific — no foam boxes or floating debris. */
export function Water() {
  const mat = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame((_, dt) => {
    if (mat.current) mat.current.uniforms.uTime.value += dt;
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[110, -0.42, 0]} frustumCulled={false}>
      <planeGeometry args={[520, 520, 64, 48]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={waterVertex}
        fragmentShader={waterFragment}
      />
    </mesh>
  );
}
