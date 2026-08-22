import { useEffect, useState } from "react";
import { Cloud, Clouds, Sky, Stars } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { MeshLambertMaterial } from "three";
import { sampleAtmosphere, type Atmosphere } from "@/systems/dayNight";
import { useAppStore } from "@/systems/store";
import { NightBuildingLights } from "./NightBuildingLights";

/** Soft billowy patches — kept within the campus camera far plane. */
const PATCHES = [
  { seed: 1, position: [-28, 48, -55] as const, bounds: [22, 5, 10] as const, volume: 18, segments: 32 },
  { seed: 2, position: [18, 52, -62] as const, bounds: [20, 4.5, 9] as const, volume: 16, segments: 28 },
  { seed: 3, position: [42, 44, -28] as const, bounds: [16, 4, 8] as const, volume: 14, segments: 26 },
  { seed: 4, position: [-48, 46, -12] as const, bounds: [18, 4.2, 9] as const, volume: 15, segments: 28 },
  { seed: 5, position: [-8, 56, -78] as const, bounds: [26, 5.5, 12] as const, volume: 22, segments: 36 },
  { seed: 6, position: [32, 50, 8] as const, bounds: [14, 3.8, 7] as const, volume: 12, segments: 24 },
  { seed: 7, position: [-22, 42, 35] as const, bounds: [15, 3.5, 7] as const, volume: 11, segments: 22 },
] as const;

function useClockAtmosphere() {
  const [sky, setSky] = useState<Atmosphere>(() => sampleAtmosphere());

  useEffect(() => {
    const tick = () => setSky(sampleAtmosphere());
    tick();
    const id = window.setInterval(tick, 30_000);
    const onVis = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return sky;
}

function ClearColorSync({ color }: { color: string }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    gl.setClearColor(color);
  }, [gl, color]);
  return null;
}

export function Lighting() {
  const interior = useAppStore((s) => s.interior);
  const gpuShadows = useAppStore((s) => s.gpuShadows);
  const reducedMotion = useAppStore((s) => s.reducedMotion);
  const museum = interior === "gallery" || interior === "awards";
  const drift = reducedMotion ? 0 : 0.12;
  const sky = useClockAtmosphere();

  const ambientI = museum ? Math.min(sky.ambientIntensity, 0.42) : sky.ambientIntensity;
  const hemiI = museum ? Math.min(sky.hemiIntensity, 0.2) : sky.hemiIntensity;
  const sunI = museum ? Math.min(sky.sunIntensity, 0.28) : sky.sunIntensity;
  const fillI = museum ? Math.min(sky.fillIntensity, 0.08) : sky.fillIntensity;
  const rimI = museum ? Math.min(sky.rimIntensity, 0.05) : sky.rimIntensity;
  const porchI = museum ? Math.min(sky.porchIntensity, 0.15) : sky.porchIntensity;

  return (
    <>
      <ClearColorSync color={sky.background} />
      <color attach="background" args={[sky.background]} />
      <fog key={sky.fog} attach="fog" args={[sky.fog, sky.fogNear, sky.fogFar]} />

      <Sky
        distance={95}
        sunPosition={sky.sunPosition}
        turbidity={sky.turbidity}
        rayleigh={sky.rayleigh}
        mieCoefficient={sky.mieCoefficient}
        mieDirectionalG={sky.mieDirectionalG}
      />

      {!museum && sky.starOpacity > 0.05 ? (
        <Stars
          radius={90}
          depth={42}
          count={reducedMotion ? 600 : 1600}
          factor={3.2}
          saturation={0}
          fade
          speed={reducedMotion ? 0 : 0.15}
        />
      ) : null}

      {!museum && sky.showClouds ? (
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
              opacity={sky.cloudOpacity}
              fade={28}
              color={sky.cloudColor}
            />
          ))}
        </Clouds>
      ) : null}

      <ambientLight intensity={ambientI} color={sky.ambientColor} />
      <hemisphereLight color={sky.hemiSky} groundColor={sky.hemiGround} intensity={hemiI} />
      <directionalLight
        position={sky.sunPosition}
        intensity={sunI}
        color={sky.sunColor}
        castShadow={!museum && gpuShadows && sky.sunIntensity > 0.4}
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
      <directionalLight position={[6, 14, 22]} intensity={fillI} color={sky.fillColor} />
      <pointLight
        position={[0, 9.4, -16.4]}
        intensity={porchI}
        distance={16}
        decay={2}
        color={sky.porchColor}
      />
      <directionalLight position={[-22, 14, -8]} intensity={rimI} color={sky.rimColor} />
      <NightBuildingLights glow={sky.buildingGlow} enabled={!museum} />
    </>
  );
}
