import { Cloud, Clouds, Sky } from "@react-three/drei";
import { MeshLambertMaterial } from "three";
import { useAppStore } from "@/systems/store";

/** Soft billowy patches — kept within the campus camera far plane (~180). */
const PATCHES = [
  { seed: 1, position: [-28, 48, -55] as const, bounds: [22, 5, 10] as const, volume: 18, segments: 32 },
  { seed: 2, position: [18, 52, -62] as const, bounds: [20, 4.5, 9] as const, volume: 16, segments: 28 },
  { seed: 3, position: [42, 44, -28] as const, bounds: [16, 4, 8] as const, volume: 14, segments: 26 },
  { seed: 4, position: [-48, 46, -12] as const, bounds: [18, 4.2, 9] as const, volume: 15, segments: 28 },
  { seed: 5, position: [-8, 56, -78] as const, bounds: [26, 5.5, 12] as const, volume: 22, segments: 36 },
  { seed: 6, position: [32, 50, 8] as const, bounds: [14, 3.8, 7] as const, volume: 12, segments: 24 },
  { seed: 7, position: [-22, 42, 35] as const, bounds: [15, 3.5, 7] as const, volume: 11, segments: 22 },
] as const;

export function Lighting() {
  const interior = useAppStore((s) => s.interior);
  const gpuShadows = useAppStore((s) => s.gpuShadows);
  const reducedMotion = useAppStore((s) => s.reducedMotion);
  const museum = interior === "gallery" || interior === "awards";
  const drift = reducedMotion ? 0 : 0.12;

  return (
    <>
      {/* Matches horizon so clear-color flashes don't look flat grey. */}
      <color attach="background" args={["#9eb8d4"]} />
      <fog attach="fog" args={["#c5d4e4", 62, 155]} />

      {/* Default Sky distance is 1000 — beyond camera.far (180) — so it never drew. */}
      <Sky
        distance={95}
        sunPosition={[32, 48, 28]}
        turbidity={2.6}
        rayleigh={1.05}
        mieCoefficient={0.0035}
        mieDirectionalG={0.82}
      />

      {!museum ? (
        <Clouds material={MeshLambertMaterial} frustumCulled={false} limit={280}>
          {PATCHES.map((patch) => (
            <Cloud
              key={patch.seed}
              seed={patch.seed}
              position={patch.position}
              bounds={patch.bounds}
              volume={patch.volume}
              segments={patch.segments}
              concentrate="inside"
              growth={4}
              speed={drift}
              opacity={0.88}
              fade={28}
              color="#f4f7fb"
            />
          ))}
        </Clouds>
      ) : null}

      <ambientLight intensity={museum ? 0.42 : 0.52} color="#fff6ea" />
      <hemisphereLight args={["#dce8f5", "#5a6e48", museum ? 0.2 : 0.48]} />
      <directionalLight
        position={[18, 36, 42]}
        intensity={museum ? 0.28 : 1.85}
        color="#ffe6b8"
        castShadow={!museum && gpuShadows}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={2}
        shadow-camera-far={110}
        shadow-camera-left={-32}
        shadow-camera-right={32}
        shadow-camera-top={32}
        shadow-camera-bottom={-32}
        shadow-bias={-0.00012}
        shadow-normalBias={0.035}
        shadow-radius={2.5}
      />
      <directionalLight position={[6, 14, 22]} intensity={museum ? 0.08 : 0.5} color="#ffe9c4" />
      <pointLight
        position={[0, 9.4, -16.4]}
        intensity={museum ? 0.15 : 1.35}
        distance={16}
        decay={2}
        color="#ffe6c2"
      />
      <directionalLight position={[-22, 14, -8]} intensity={museum ? 0.05 : 0.28} color="#a8c0dc" />
    </>
  );
}
