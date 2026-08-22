import { useMemo } from "react";
import { BackSide, BufferAttribute, BufferGeometry, Color, AdditiveBlending } from "three";
import { nightSkyFragment, nightSkyVertex } from "./shaders/nightSky";

/** Moon sits high and off-axis — cool fill without competing with warm fixtures. */
export const MOON_DIR: [number, number, number] = [0.62, 0.72, -0.35];
export const MOON_POS: [number, number, number] = [52, 58, -28];

function seeded(n: number) {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

function buildStarGeometry(count: number) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const c = new Color();

  for (let i = 0; i < count; i++) {
    // Upper hemisphere bias — fewer stars near horizon haze
    const u = seeded(i * 3.1 + 1.7);
    const v = seeded(i * 5.7 + 2.3);
    const theta = u * Math.PI * 2;
    const phi = Math.acos(0.08 + Math.pow(v, 0.65) * 0.92); // favor zenith a bit
    const r = 88;
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.cos(phi);
    const z = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    const bright = 0.35 + seeded(i * 9.1) * 0.65;
    const tint = seeded(i * 11.3);
    if (tint < 0.15) c.setRGB(0.75 * bright, 0.82 * bright, 1.0 * bright);
    else if (tint > 0.88) c.setRGB(1.0 * bright, 0.92 * bright, 0.78 * bright);
    else c.setRGB(0.9 * bright, 0.93 * bright, 1.0 * bright);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
    sizes[i] = 0.6 + seeded(i * 13.7) * 1.8;
  }

  const geom = new BufferGeometry();
  geom.setAttribute("position", new BufferAttribute(positions, 3));
  geom.setAttribute("color", new BufferAttribute(colors, 3));
  geom.setAttribute("size", new BufferAttribute(sizes, 1));
  return geom;
}

const starVertex = /* glsl */ `
  attribute float size;
  varying vec3 vColor;
  void main() {
    vColor = color;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (180.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const starFragment = /* glsl */ `
  varying vec3 vColor;
  uniform float uOpacity;
  void main() {
    vec2 p = gl_PointCoord - vec2(0.5);
    float d = length(p);
    float a = smoothstep(0.5, 0.08, d) * uOpacity;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a);
  }
`;

export function NightSkyDome({
  opacity = 1,
  reducedMotion = false,
}: {
  opacity?: number;
  reducedMotion?: boolean;
}) {
  const starGeom = useMemo(() => buildStarGeometry(reducedMotion ? 520 : 980), [reducedMotion]);
  const moonUniforms = useMemo(
    () => ({
      uMoonDir: { value: [...MOON_DIR] as [number, number, number] },
      uMoonGlow: { value: 1 },
    }),
    [],
  );
  const starUniforms = useMemo(() => ({ uOpacity: { value: opacity } }), [opacity]);

  if (opacity < 0.04) return null;

  return (
    <group>
      <mesh renderOrder={-2} frustumCulled={false}>
        <sphereGeometry args={[95, 32, 24]} />
        <shaderMaterial
          vertexShader={nightSkyVertex}
          fragmentShader={nightSkyFragment}
          uniforms={moonUniforms}
          side={BackSide}
          depthWrite={false}
        />
      </mesh>

      <points geometry={starGeom} frustumCulled={false} renderOrder={-1}>
        <shaderMaterial
          vertexShader={starVertex}
          fragmentShader={starFragment}
          uniforms={starUniforms}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
          vertexColors
        />
      </points>

      {/* Soft moon disc — off to the side, not a camera centerpiece */}
      <mesh position={MOON_POS} renderOrder={-1}>
        <sphereGeometry args={[2.4, 16, 12]} />
        <meshBasicMaterial color="#e8eef8" toneMapped={false} />
      </mesh>
      <mesh position={MOON_POS}>
        <sphereGeometry args={[3.6, 12, 10]} />
        <meshBasicMaterial
          color="#c5d0e8"
          transparent
          opacity={0.12 * opacity}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** Cool moonlight fill — primary warm light still comes from campus fixtures. */
export function MoonLight({ intensity }: { intensity: number }) {
  if (intensity < 0.02) return null;
  return (
    <directionalLight
      position={MOON_POS}
      intensity={intensity}
      color="#a8b8d4"
      castShadow={false}
    />
  );
}
