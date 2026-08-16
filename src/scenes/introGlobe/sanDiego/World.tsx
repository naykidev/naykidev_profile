import { Suspense } from "react";
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

export function SanDiegoWorld({ elapsed, fade = 1 }: { elapsed: number; fade?: number }) {
  return (
    <>
      <Lighting />
      <SkyDome />
      <CameraRig elapsed={elapsed} fade={fade} />
      <Terrain />
      <Cliffs />
      <Mountains />
      <Suspense fallback={null}>
        <Palms />
      </Suspense>
      <Suspense fallback={null}>
        <Nature />
      </Suspense>
      <Suspense fallback={null}>
        <Details />
      </Suspense>
      <Surf />
      <Water />
      <Clouds />
    </>
  );
}
