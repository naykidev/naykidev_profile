import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useAppStore } from "@/systems/store";

/** Subtle warm bleed on frosted diffusers — restrained for a premium look. */
export function CampusBloom({ nightGlow }: { nightGlow: number }) {
  const reducedMotion = useAppStore((s) => s.reducedMotion);
  if (reducedMotion || nightGlow < 0.18) return null;

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        luminanceThreshold={0.92}
        luminanceSmoothing={0.45}
        intensity={0.22 + nightGlow * 0.28}
        mipmapBlur
      />
    </EffectComposer>
  );
}
