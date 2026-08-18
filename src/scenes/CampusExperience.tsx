import { PCFSoftShadowMap } from "three";
import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import { BascomHall } from "@/components/3d/world/BascomHall";
import { InteractiveSite } from "@/components/3d/world/InteractiveSite";
import {
  DistantWater,
  NextChapter,
  SurroundingBuildings,
} from "@/components/3d/world/Districts";
import { AwardsGallery, ProjectGallery } from "@/components/3d/world/ProjectGallery";
import { Lighting } from "@/components/3d/world/Lighting";
import { LincolnMonument } from "@/components/3d/world/LincolnMonument";
import { MallPaths, Terrain } from "@/components/3d/world/Terrain";
import { TreeField } from "@/components/3d/world/Trees";
import { CampusBanners, FramingGroves } from "@/components/3d/world/CampusBanners";
import { CameraDirector } from "@/components/3d/player/CameraDirector";
import { GpuQualityController } from "@/components/3d/player/GpuQualityController";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";
import { useIntroCampusLive } from "@/hooks/useIntroSequence";
import { usePageVisible } from "@/hooks/usePageVisible";
import { useAppStore } from "@/systems/store";

export function CampusScene() {
  const reducedMotion = useAppStore((s) => s.reducedMotion);
  const coarse = useCoarsePointer();
  const visible = usePageVisible();
  const campusLive = useIntroCampusLive();
  const drawing = visible && campusLive;

  return (
    <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%", touchAction: "none" }}>
      <Canvas
        shadows={!reducedMotion}
        dpr={reducedMotion ? [1, 1] : [1, 1.5]}
        frameloop={drawing ? "always" : "never"}
        gl={{
          antialias: !coarse,
          powerPreference: "high-performance",
          stencil: false,
        }}
        camera={{ fov: coarse ? 62 : 50, near: 0.12, far: 180, position: [8, 4, 28] }}
        onCreated={({ gl }) => {
          gl.setClearColor("#c9d4e0");
          gl.shadowMap.enabled = !reducedMotion && !coarse;
          gl.shadowMap.type = PCFSoftShadowMap;
        }}
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <GpuQualityController coarse={coarse} />
        <Lighting />
        <Terrain />
        <MallPaths />
        <InteractiveSite locationId="bascom-hall">
          <BascomHall />
        </InteractiveSite>
        <InteractiveSite locationId="lincoln">
          <LincolnMonument />
        </InteractiveSite>
        <CampusBanners />
        <FramingGroves />
        <SurroundingBuildings />
        <InteractiveSite locationId="projects-gallery">
          <ProjectGallery />
        </InteractiveSite>
        <InteractiveSite locationId="awards-gallery">
          <AwardsGallery />
        </InteractiveSite>
        <InteractiveSite locationId="future">
          <NextChapter />
        </InteractiveSite>
        <TreeField />
        <DistantWater />
        <CameraDirector />
        <Preload all />
      </Canvas>
    </div>
  );
}
