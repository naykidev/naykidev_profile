import { lazy } from "react";

/**
 * Optional GLB swap-in. Procedural campus meshes are the default so the
 * first slice stays light. Drop compressed models into /public/models and
 * replace a procedural component with <LazyModel url="..." />.
 */
export const LazyModel = lazy(async () => {
  const { useGLTF } = await import("@react-three/drei");
  function Model({ url }: { url: string }) {
    const gltf = useGLTF(url);
    return <primitive object={gltf.scene} />;
  }
  return { default: Model };
});
