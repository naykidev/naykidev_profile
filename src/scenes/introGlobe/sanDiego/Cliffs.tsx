import { coastHeight, shoreXAt } from "./noise";

const ZS = [-28, -16, -4, 8, 20];

export function Cliffs() {
  return (
    <group>
      {ZS.map((z, i) => {
        const x = shoreXAt(z) - 0.35;
        const y = coastHeight(x, z) + 0.15;
        return (
          <mesh
            key={z}
            position={[x, y, z]}
            rotation={[0.08, 0.1 * (i % 2 === 0 ? 1 : -1), 0.04]}
            scale={[1.6, 1.5 + (i % 3) * 0.25, 7]}
            receiveShadow
          >
            <icosahedronGeometry args={[0.7, 1]} />
            <meshLambertMaterial color={i % 2 ? "#d2b07a" : "#c4a068"} flatShading />
          </mesh>
        );
      })}
    </group>
  );
}
