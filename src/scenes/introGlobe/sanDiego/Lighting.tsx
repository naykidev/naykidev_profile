/** Horizon-matched fog + soft warm coastal sunlight. */
export function Lighting() {
  return (
    <>
      <color attach="background" args={["#c5d8ec"]} />
      <fog attach="fog" args={["#c5d8ec", 55, 240]} />
      <ambientLight intensity={0.72} color="#fff6ea" />
      <hemisphereLight args={["#d8e8f8", "#c4b090", 0.62]} />
      <directionalLight position={[-22, 48, 18]} intensity={1.15} color="#fff2d8" />
      <directionalLight position={[30, 18, -12]} intensity={0.28} color="#a8c4e0" />
    </>
  );
}
