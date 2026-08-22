/** Soft stylized cloud puffs — near + far so the sky isn’t empty at the horizon. */
const PATCHES: [number, number, number, number, number, number][] = [
  [-18, 22, -36, 7.5, 3.2, 5.5],
  [4, 24, -42, 8.5, 3.6, 6.2],
  [-32, 20, 8, 6.5, 2.8, 5],
  [28, 23, -30, 7, 3, 5.4],
  [-10, 21, 38, 6.8, 2.9, 5.1],
  [-55, 28, -50, 11, 4.2, 7],
  [48, 30, -70, 12, 4.5, 8],
  [-70, 26, 40, 10, 3.8, 6.5],
  [60, 32, 55, 13, 4.8, 8.5],
  [-20, 34, -90, 14, 5, 9],
  [15, 36, 95, 12, 4.4, 8],
];

export function Clouds() {
  return (
    <group>
      {PATCHES.map((p, i) => (
        <group key={i} position={[p[0], p[1], p[2]]}>
          <mesh scale={[p[3], p[4], p[5]]}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshLambertMaterial color="#eceae4" />
          </mesh>
          <mesh position={[p[3] * 0.38, 0.35, 0.25]} scale={[p[3] * 0.62, p[4] * 0.85, p[5] * 0.7]}>
            <sphereGeometry args={[1, 7, 5]} />
            <meshLambertMaterial color="#e4e1da" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
