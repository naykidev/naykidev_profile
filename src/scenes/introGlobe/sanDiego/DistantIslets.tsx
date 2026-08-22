import { coastHeightFar } from "./noise";

/** Tiny distant islets — silhouettes only, cheap shared geometry. */
const ISLETS: [number, number, number, number][] = [
  [95, -70, 4.5, 1.4],
  [110, 40, 5.2, 1.6],
  [88, 95, 3.8, 1.2],
  [125, -20, 6, 1.8],
];

export function DistantIslets() {
  return (
    <group>
      {ISLETS.map(([x, z, s, hy]) => {
        const y = coastHeightFar(x, z) + hy;
        return (
          <mesh key={`${x}-${z}`} position={[x, y, z]} scale={[s, hy * 1.4, s * 0.85]} frustumCulled={false}>
            <icosahedronGeometry args={[1, 0]} />
            <meshLambertMaterial color="#7a9268" flatShading />
          </mesh>
        );
      })}
    </group>
  );
}
