import { Sky } from "@react-three/drei";
import { useAppStore } from "@/systems/store";

export function Lighting() {
  const interior = useAppStore((s) => s.interior);
  const museum = interior === "gallery" || interior === "awards";

  return (
    <>
      <color attach="background" args={["#c9d4e0"]} />
      <fog attach="fog" args={["#d5c4a8", 55, 140]} />
      <Sky
        sunPosition={[20, 38, 42]}
        turbidity={3.4}
        rayleigh={0.45}
        mieCoefficient={0.004}
        mieDirectionalG={0.88}
      />
      <ambientLight intensity={museum ? 0.42 : 0.58} color="#fff3e0" />
      <hemisphereLight args={["#fff4e4", "#4a5a40", museum ? 0.2 : 0.42]} />
      <directionalLight
        position={[18, 36, 42]}
        intensity={museum ? 0.28 : 1.95}
        color="#ffe0a8"
        castShadow={!museum}
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
      <directionalLight position={[6, 14, 22]} intensity={museum ? 0.08 : 0.55} color="#ffe9c4" />
      <pointLight
        position={[0, 9.4, -16.4]}
        intensity={museum ? 0.15 : 1.35}
        distance={16}
        decay={2}
        color="#ffe6c2"
      />
      <directionalLight position={[-22, 14, -8]} intensity={museum ? 0.05 : 0.22} color="#9eb6d0" />
    </>
  );
}
