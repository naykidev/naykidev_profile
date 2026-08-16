import { coastHeight } from "./noise";

export function Mountains() {
  const northY = coastHeight(10, -58) + 3.4;
  const southY = coastHeight(16, 54) + 2.6;
  return (
    <group>
      <mesh position={[10, northY, -58]} rotation={[0, 0.3, 0]} scale={[16, 6.2, 9]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshLambertMaterial color="#9aaa78" flatShading />
      </mesh>
      <mesh position={[16, southY, 54]} rotation={[0, -0.25, 0]} scale={[14, 5.2, 8]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshLambertMaterial color="#a7b086" flatShading />
      </mesh>
    </group>
  );
}
