import { coastHeight, coastHeightFar } from "./noise";

type Peak = {
  x: number;
  z: number;
  sx: number;
  sy: number;
  sz: number;
  yaw: number;
  color: string;
  far?: boolean;
};

const PEAKS: Peak[] = [
  { x: 10, z: -58, sx: 16, sy: 6.2, sz: 9, yaw: 0.3, color: "#9aaa78" },
  { x: 16, z: 54, sx: 14, sy: 5.2, sz: 8, yaw: -0.25, color: "#a7b086" },
  { x: -48, z: -72, sx: 22, sy: 9.5, sz: 14, yaw: 0.4, color: "#8a9a72", far: true },
  { x: -62, z: 20, sx: 18, sy: 7.8, sz: 12, yaw: -0.15, color: "#7f9270", far: true },
  { x: -40, z: 78, sx: 20, sy: 8.2, sz: 13, yaw: 0.2, color: "#92a07c", far: true },
  { x: 55, z: -95, sx: 12, sy: 4.2, sz: 9, yaw: 0.5, color: "#a8b090", far: true },
  { x: 70, z: 88, sx: 11, sy: 3.6, sz: 8, yaw: -0.35, color: "#9eae84", far: true },
  { x: -95, z: -30, sx: 26, sy: 11, sz: 16, yaw: 0.1, color: "#74866a", far: true },
];

export function Mountains() {
  return (
    <group>
      {PEAKS.map((p) => {
        const y = (p.far ? coastHeightFar(p.x, p.z) : coastHeight(p.x, p.z)) + p.sy * 0.45;
        return (
          <mesh
            key={`${p.x}-${p.z}`}
            position={[p.x, y, p.z]}
            rotation={[0, p.yaw, 0]}
            scale={[p.sx, p.sy, p.sz]}
            frustumCulled={false}
          >
            <icosahedronGeometry args={[1, 1]} />
            <meshLambertMaterial color={p.color} flatShading />
          </mesh>
        );
      })}
    </group>
  );
}
