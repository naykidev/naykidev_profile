import { shoreXAt } from "./noise";
import { CoastTown } from "./CoastTown";

function Pier() {
  const z = 6;
  const x0 = shoreXAt(z) + 1.2;
  return (
    <group>
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[x0 + i * 1.15, -0.05, z]} castShadow receiveShadow>
          <boxGeometry args={[1.05, 0.12, 1.35]} />
          <meshLambertMaterial color="#8a6a45" />
        </mesh>
      ))}
    </group>
  );
}

export function Details() {
  return (
    <group>
      <CoastTown />
      <Pier />
    </group>
  );
}
