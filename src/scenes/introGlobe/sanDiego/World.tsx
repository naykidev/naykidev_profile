import { Suspense } from "react";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";
import { CameraRig } from "./CameraRig";
import { Cliffs } from "./Cliffs";
import { Clouds } from "./Clouds";
import { Details } from "./Details";
import { Lighting } from "./Lighting";
import { Mountains } from "./Mountains";
import { Palms } from "./Palms";
import { SkyDome } from "./Sky";
import { Terrain } from "./Terrain";
import { Nature } from "./Nature";
import { Surf, Water } from "./Water";

export function SanDiegoWorld({
  elapsed = 0,
  fade = 1,
  followIntro = false,
}: {
  elapsed?: number;
  fade?: number;
  followIntro?: boolean;
}) {
  const coarse = useCoarsePointer();
  return (
    <>
      <Lighting />
      <SkyDome />
      <CameraRig elapsed={elapsed} fade={fade} followIntro={followIntro} />
      <Terrain />
      <Cliffs />
      <Mountains />
      <Suspense fallback={null}>
        <Palms />
      </Suspense>
      {coarse ? null : (
        <Suspense fallback={null}>
          <Nature />
        </Suspense>
      )}
      <Suspense fallback={null}>
        <Details />
      </Suspense>
      <Surf />
      <Water />
      <Clouds />
    </>
  );
}
