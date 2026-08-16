export function Lighting() {
  return (
    <>
      <fog attach="fog" args={["#e4ddd0", 38, 92]} />
      <ambientLight intensity={1.05} color="#fff4e6" />
      <hemisphereLight args={["#e7ece8", "#cbb892", 0.55]} />
      <directionalLight
        position={[-16, 40, 22]}
        intensity={1.15}
        color="#fff6e4"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.00025}
        shadow-camera-far={140}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
    </>
  );
}
