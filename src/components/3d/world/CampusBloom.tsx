import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useAppStore } from "@/systems/store";

/** Soft warm bleed on emissive fixtures — skipped on coarse / reduced-motion. */
export function CampusBloom({ nightGlow }: { nightGlow: number }) {
  const reducedMotion = useAppStore((s) => s.reducedMotion);
  if (reducedMotion || nightGlow < 0.12) return null;

  const intensity = 0.55 + nightGlow * 0.75;

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        luminanceThreshold={0.8}
        luminanceSmoothing={0.35}
        intensity={Math.min(1.35, intensity)}
        mipmapBlur
      />
    </EffectComposer>
  );
}
