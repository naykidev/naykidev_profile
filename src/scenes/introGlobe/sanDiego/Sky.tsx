import { BackSide } from "three";
import { skyFragment, skyVertex } from "./shaders/sky";

export function SkyDome() {
  return (
    <mesh frustumCulled={false}>
      <sphereGeometry args={[460, 32, 20]} />
      <shaderMaterial
        vertexShader={skyVertex}
        fragmentShader={skyFragment}
        side={BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}
