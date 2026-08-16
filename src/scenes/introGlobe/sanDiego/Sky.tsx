import { BackSide } from "three";
import { skyFragment, skyVertex } from "./shaders/sky";

export function SkyDome() {
  return (
    <mesh>
      <sphereGeometry args={[380, 24, 16]} />
      <shaderMaterial vertexShader={skyVertex} fragmentShader={skyFragment} side={BackSide} depthWrite={false} />
    </mesh>
  );
}
