export function Lighting() {
  return (
    <>
      <fog attach="fog" args={["#e4ddd0", 38, 92]} />
      <ambientLight intensity={1.05} color="#fff4e6" />
      <hemisphereLight args={["#e7ece8", "#cbb892", 0.55]} />
      <directionalLight position={[-16, 40, 22]} intensity={1.35} color="#fff6e4" />
    </>
  );
}
