import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Suspense, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Group,
  MathUtils,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  RepeatWrapping,
  SpotLight,
  SRGBColorSpace,
} from "three";
import { awardPieces } from "@/data/achievements";
import { galleryPieces, type GalleryPiece } from "@/data/projects";
import {
  GALLERY_DOOR_HEIGHT,
  GALLERY_DOOR_WIDTH,
  GALLERY_HEIGHT,
  GALLERY_SIZE_X,
  GALLERY_SIZE_Z,
  GALLERY_X,
  GALLERY_Z,
  awardsDoorX,
  galleryDoorX,
} from "@/systems/campusLayout";
import {
  CERT_H,
  CERT_W,
  FRAME_H,
  FRAME_W,
  FRAME_Y,
  HALL_HALF_X as HALF_X,
  HALL_HALF_Z as HALF_Z,
  awardFrameSlots,
  museumFrameSlots,
} from "@/systems/hallFrames";
import { interactLocation } from "@/systems/interaction";
import { wasLookDrag } from "@/systems/lookDrag";
import { useAppStore, type InteriorId } from "@/systems/store";
import { getTerrainHeight } from "@/systems/terrain";
import {
  creamStone,
  bronze,
  brassPlaque,
  doorWood,
  galleryTrim,
  glass,
  museumBaseboard,
  museumFloor,
  museumWall,
  roofCopper,
  sandstone,
  sandstoneDeep,
  walnutFrame,
  windowFrame,
} from "./materials";
import { awardsSignMap, gallerySignMap, makePlaqueTexture } from "./textures";
import { asset } from "@/lib/asset";

const WALL = 0.3;
const DOOR_W = GALLERY_DOOR_WIDTH;
const DOOR_H = GALLERY_DOOR_HEIGHT;
const FRAME_D = 0.16;
const CANVAS_W = 2.02;
const CANVAS_H = 1.34;

function containInMat(maxW: number, maxH: number, aspect: number) {
  const box = maxW / maxH;
  if (aspect >= box) return { w: maxW, h: maxW / aspect };
  return { w: maxH * aspect, h: maxH };
}

const fixtureMetal = new MeshStandardMaterial({
  color: "#2a2a2c",
  roughness: 0.38,
  metalness: 0.62,
});

const fixtureGlow = new MeshStandardMaterial({
  color: "#fff6d8",
  emissive: "#ffe4a8",
  emissiveIntensity: 1.8,
  roughness: 0.35,
  metalness: 0,
});

function PictureLight({ lit, frameH }: { lit: boolean; frameH: number }) {
  fixtureGlow.emissiveIntensity = lit ? 0.85 : 0.08;
  return (
    <group position={[0, frameH / 2 + 0.2, 0.05]}>
      <mesh position={[0, 0.02, 0]} material={bronze} castShadow>
        <boxGeometry args={[0.2, 0.1, 0.05]} />
      </mesh>
      <mesh position={[0, 0.01, 0.14]} rotation={[Math.PI / 2.6, 0, 0]} material={bronze} castShadow>
        <cylinderGeometry args={[0.022, 0.022, 0.3, 8]} />
      </mesh>
      <group position={[0, -0.1, 0.28]} rotation={[0.62, 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} material={fixtureMetal} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.98, 18]} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]} position={[0, -0.02, 0]} material={fixtureGlow}>
          <cylinderGeometry args={[0.048, 0.048, 0.86, 16]} />
        </mesh>
        {[-0.49, 0.49].map((x) => (
          <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={bronze}>
            <cylinderGeometry args={[0.074, 0.074, 0.04, 16]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function SecondPlaceRibbons() {
  const map = useTexture(asset("/textures/projects/second-place-ribbon.png"));
  useLayoutEffect(() => {
    const img = map.image as HTMLImageElement | HTMLCanvasElement | undefined;
    if (!img || map.userData.punched) return;
    const source = document.createElement("canvas");
    source.width = img.width;
    source.height = img.height;
    const ctx = source.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, 0, 0);
    const pixels = ctx.getImageData(0, 0, source.width, source.height);
    for (let i = 0; i < pixels.data.length; i += 4) {
      if (pixels.data[i] > 242 && pixels.data[i + 1] > 242 && pixels.data[i + 2] > 242) {
        pixels.data[i + 3] = 0;
      }
    }
    ctx.putImageData(pixels, 0, 0);
    map.image = source;
    map.needsUpdate = true;
    map.colorSpace = SRGBColorSpace;
    map.userData.punched = true;
  }, [map]);

  const y = -FRAME_H / 2 - 0.36;
  // Slightly smaller than the old desktop-tuned ribbons so they don't dominate on phone zooms.
  const ribbonW = 0.3;
  const ribbonH = 0.44;
  return (
    <group>
      {[-0.7, 0.7].map((x) => (
        <mesh key={x} position={[x, y, 0.05]}>
          <planeGeometry args={[ribbonW, ribbonH]} />
          <meshStandardMaterial
            map={map}
            transparent
            roughness={0.72}
            metalness={0}
            envMapIntensity={0}
            alphaTest={0.08}
          />
        </mesh>
      ))}
    </group>
  );
}

function ProjectFrame({
  piece,
  position,
  rotation,
  scale = 1,
  tiny = false,
  hall,
}: {
  piece: GalleryPiece;
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: number;
  tiny?: boolean;
  hall: Exclude<InteriorId, null>;
}) {
  const interior = useAppStore((s) => s.interior);
  const selected = useAppStore((s) => s.galleryProjectId === piece.id);
  const setGalleryProject = useAppStore((s) => s.setGalleryProject);
  const [hovered, setHovered] = useState(false);
  const lightRef = useRef<SpotLight>(null);
  const targetRef = useRef<Object3D>(null);
  const portrait = useTexture(piece.portrait);
  portrait.colorSpace = SRGBColorSpace;
  portrait.anisotropy = 8;
  portrait.needsUpdate = true;
  const mounted = hall === "gallery";
  const plaqueMap = useMemo(
    () => (mounted ? makePlaqueTexture(piece.name) : null),
    [mounted, piece.name],
  );
  const canvasMat = useMemo(
    () =>
      new MeshBasicMaterial({
        map: portrait,
        toneMapped: false,
      }),
    [portrait],
  );
  const plaqueMat = useMemo(
    () =>
      plaqueMap
        ? new MeshStandardMaterial({
            map: plaqueMap,
            roughness: 0.35,
            metalness: 0.55,
          })
        : null,
    [plaqueMap],
  );

  useLayoutEffect(() => {
    const light = lightRef.current;
    const target = targetRef.current;
    if (light && target) {
      light.target = target;
    }
  }, []);

  useLayoutEffect(() => {
    return () => {
      canvasMat.dispose();
      plaqueMat?.dispose();
      plaqueMap?.dispose();
    };
  }, [canvasMat, plaqueMap, plaqueMat]);

  const active = hovered || selected;
  const lit = interior === hall;
  const frameW = tiny ? CERT_W : FRAME_W;
  const frameH = tiny ? CERT_H : FRAME_H;
  const matW = tiny ? CERT_W - 0.1 : CANVAS_W;
  const matH = tiny ? CERT_H - 0.1 : CANVAS_H;
  const img = portrait.image as { width?: number; height?: number } | undefined;
  const aspect = img?.width && img?.height ? img.width / img.height : matW / matH;
  const { w: canvasW, h: canvasH } = containInMat(matW, matH, aspect);
  const moulding = tiny ? 0.09 : FRAME_D;

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh position={[0, 0, -moulding / 2]} material={walnutFrame} castShadow>
        <boxGeometry args={[frameW, frameH, moulding]} />
      </mesh>
      <mesh position={[0, 0, 0.012]} material={walnutFrame}>
        <boxGeometry args={[matW + 0.05, matH + 0.05, 0.03]} />
      </mesh>
      <mesh
        position={[0, 0, 0.04]}
        material={canvasMat}
        onPointerOver={(event) => {
          if (!lit) return;
          event.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "";
        }}
        onClick={(event) => {
          if (!lit || wasLookDrag()) return;
          event.stopPropagation();
          setGalleryProject(piece.id);
        }}
      >
        <planeGeometry args={[canvasW, canvasH]} />
      </mesh>
      {active && lit ? (
        <mesh position={[0, 0, -moulding / 2 - 0.015]}>
          <boxGeometry args={[frameW + 0.04, frameH + 0.04, 0.018]} />
          <meshStandardMaterial
            color="#e8d3a8"
            emissive="#c9a66b"
            emissiveIntensity={0.4}
            roughness={0.4}
          />
        </mesh>
      ) : null}

      {mounted ? (
        <>
          <mesh position={[0, -frameH / 2 - 0.26, 0.02]} material={brassPlaque} castShadow>
            <boxGeometry args={[1.05, 0.18, 0.05]} />
          </mesh>
          {plaqueMat ? (
            <mesh position={[0, -frameH / 2 - 0.26, 0.048]} material={plaqueMat}>
              <planeGeometry args={[0.98, 0.14]} />
            </mesh>
          ) : null}
          {piece.id === "weather-report" ? <SecondPlaceRibbons /> : null}
          <mesh position={[0, -FRAME_Y + 0.07, 0.95]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.7, 1.55]} />
            <meshBasicMaterial color="#1a120c" transparent opacity={0.22} depthWrite={false} />
          </mesh>
          <PictureLight lit={lit} frameH={frameH} />
          <pointLight
            position={[0, frameH / 2 + 0.12, 0.48]}
            intensity={lit ? 0.28 : 0.04}
            distance={3.8}
            decay={2}
            color="#fff1dc"
          />
          <object3D ref={targetRef} position={[0, 0, 0.05]} />
          <spotLight
            ref={lightRef}
            position={[0, frameH / 2 + 0.22, 0.62]}
            angle={1.2}
            penumbra={0.95}
            intensity={lit ? 2.15 : 0.12}
            distance={5.5}
            decay={2}
            color="#ffe8d0"
            castShadow={false}
          />
        </>
      ) : null}
    </group>
  );
}

function useDoorTexture(src: string) {
  const map = useTexture(src);

  useLayoutEffect(() => {
    if (map.userData.punched) return;
    const img = map.image as HTMLImageElement | HTMLCanvasElement | undefined;
    if (!img) return;
    const source = document.createElement("canvas");
    source.width = img.width;
    source.height = img.height;
    const ctx = source.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, 0, 0);
    const pixels = ctx.getImageData(0, 0, source.width, source.height);
    for (let i = 0; i < pixels.data.length; i += 4) {
      if (pixels.data[i] > 248 && pixels.data[i + 1] > 248 && pixels.data[i + 2] > 248) {
        pixels.data[i + 3] = 0;
      }
    }
    ctx.putImageData(pixels, 0, 0);
    map.image = source;
    map.colorSpace = SRGBColorSpace;
    map.anisotropy = 8;
    map.needsUpdate = true;
    map.userData.punched = true;
  }, [map]);

  return map;
}

function DoorLeafFace({
  src,
  width,
  height,
  z,
}: {
  src: string;
  width: number;
  height: number;
  z: number;
}) {
  const map = useDoorTexture(src);
  return (
    <group position={[0, 0, z]}>
      <mesh position={[0.03, 0, 0]} material={doorWood} castShadow>
        <boxGeometry args={[0.08, height, width]} />
      </mesh>
      <mesh position={[-0.02, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          map={map}
          roughness={0.78}
          metalness={0}
          transparent
          alphaTest={0.12}
          envMapIntensity={0}
        />
      </mesh>
      <mesh position={[0.075, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          map={map}
          roughness={0.82}
          metalness={0}
          transparent
          alphaTest={0.12}
          envMapIntensity={0}
        />
      </mesh>
    </group>
  );
}

function GalleryDoors({ hall }: { hall: Exclude<InteriorId, null> }) {
  const left = useRef<Group>(null);
  const right = useRef<Group>(null);
  const amount = useRef(0);

  useFrame((_, dt) => {
    const { interior, cameraTransition } = useAppStore.getState();
    const opening =
      interior === hall ||
      (hall === "gallery" &&
        (cameraTransition?.kind === "enter-gallery" || cameraTransition?.kind === "exit-gallery")) ||
      (hall === "awards" &&
        (cameraTransition?.kind === "enter-awards" || cameraTransition?.kind === "exit-awards"));
    const target = opening ? 1 : 0;
    amount.current = MathUtils.damp(amount.current, target, 5.4, dt);
    if (left.current) left.current.rotation.y = -amount.current * 1.28;
    if (right.current) right.current.rotation.y = amount.current * 1.28;
  });

  const leafW = DOOR_W / 2 + 0.02;
  const leafH = DOOR_H - 0.02;
  return (
    <group position={[-HALF_X - WALL / 2 + 0.05, 0, 0]}>
      <group ref={left} position={[0, leafH / 2 + 0.01, DOOR_W / 2]}>
        <DoorLeafFace
          src={asset("/textures/gallery-door-right.png")}
          width={leafW}
          height={leafH}
          z={-leafW / 2}
        />
      </group>
      <group ref={right} position={[0, leafH / 2 + 0.01, -DOOR_W / 2]}>
        <DoorLeafFace
          src={asset("/textures/gallery-door-left.png")}
          width={leafW}
          height={leafH}
          z={leafW / 2}
        />
      </group>
    </group>
  );
}

function OakFloor() {
  const map = useTexture(asset("/textures/gallery-hardwood.png"));
  map.wrapS = RepeatWrapping;
  map.wrapT = RepeatWrapping;
  map.repeat.set(2.35, 3.5);
  map.anisotropy = 8;
  map.colorSpace = SRGBColorSpace;
  return (
    <mesh position={[0, 0.19, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[GALLERY_SIZE_X - 0.44, GALLERY_SIZE_Z - 0.44]} />
      <meshStandardMaterial map={map} color="#f3eadc" roughness={0.7} metalness={0} />
    </mesh>
  );
}

export function ProjectGallery() {
  return <MuseumHall hall="gallery" />;
}

export function AwardsGallery() {
  return <MuseumHall hall="awards" />;
}

function AwardsHiddenLighting({ lit }: { lit: boolean }) {
  return (
    <group>
      <ambientLight intensity={lit ? 0.28 : 0} color="#f7f1e6" />
      <pointLight
        position={[0.2, GALLERY_HEIGHT - 0.62, 0]}
        intensity={lit ? 0.7 : 0.05}
        distance={13}
        decay={2}
        color="#fff6ea"
      />
      <pointLight
        position={[HALF_X - 1.65, 3.15, 0]}
        intensity={lit ? 0.38 : 0.04}
        distance={8.5}
        decay={2}
        color="#fff1dc"
      />
    </group>
  );
}

function HallExit({ hall }: { hall: Exclude<InteriorId, null> }) {
  const interior = useAppStore((s) => s.interior);
  if (interior !== hall) return null;
  return (
    <mesh
      position={[-HALF_X - 0.45, DOOR_H / 2, 0]}
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
      onClick={(event) => {
        if (wasLookDrag()) return;
        event.stopPropagation();
        interactLocation(hall === "gallery" ? "gallery-exit" : "awards-exit");
      }}
    >
      <boxGeometry args={[1.15, DOOR_H, DOOR_W + 0.35]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

function MuseumHall({ hall }: { hall: Exclude<InteriorId, null> }) {
  const originX = hall === "gallery" ? GALLERY_X : -GALLERY_X;
  const doorX = hall === "gallery" ? galleryDoorX() : awardsDoorX();
  const y = getTerrainHeight(doorX, GALLERY_Z);
  const eastLen = HALF_Z - DOOR_W / 2;
  const eastCenter = (HALF_Z + DOOR_W / 2) / 2;
  const pieces = hall === "gallery" ? galleryPieces : awardPieces;
  const signMap = hall === "gallery" ? gallerySignMap : awardsSignMap;
  const interior = useAppStore((s) => s.interior);
  const hallLit = interior === hall;

  return (
    <group
      position={[originX, y, GALLERY_Z]}
      rotation={[0, hall === "gallery" ? 0 : Math.PI, 0]}
    >
      <mesh position={[0, -1.55, 0]} material={sandstoneDeep} receiveShadow>
        <boxGeometry args={[GALLERY_SIZE_X + 0.5, 3.2, GALLERY_SIZE_Z + 0.5]} />
      </mesh>
      <mesh position={[0, -0.28, 0]} material={museumFloor} receiveShadow>
        <boxGeometry args={[GALLERY_SIZE_X - 0.28, 0.95, GALLERY_SIZE_Z - 0.28]} />
      </mesh>
      <Suspense fallback={null}>
        <OakFloor />
      </Suspense>
      <mesh position={[0, GALLERY_HEIGHT - 0.1, 0]} material={museumWall}>
        <boxGeometry args={[GALLERY_SIZE_X - 0.08, 0.22, GALLERY_SIZE_Z - 0.08]} />
      </mesh>
      <mesh position={[0, GALLERY_HEIGHT + 0.22, 0]} material={roofCopper} castShadow>
        <boxGeometry args={[GALLERY_SIZE_X + 0.7, 0.42, GALLERY_SIZE_Z + 0.7]} />
      </mesh>

      <mesh position={[HALF_X, GALLERY_HEIGHT / 2, 0]} material={sandstone} castShadow receiveShadow>
        <boxGeometry args={[WALL, GALLERY_HEIGHT, GALLERY_SIZE_Z]} />
      </mesh>
      <mesh position={[0, GALLERY_HEIGHT / 2, HALF_Z]} material={sandstone} castShadow receiveShadow>
        <boxGeometry args={[GALLERY_SIZE_X, GALLERY_HEIGHT, WALL]} />
      </mesh>
      <mesh position={[0, GALLERY_HEIGHT / 2, -HALF_Z]} material={sandstone} castShadow receiveShadow>
        <boxGeometry args={[GALLERY_SIZE_X, GALLERY_HEIGHT, WALL]} />
      </mesh>
      <mesh
        position={[-HALF_X, GALLERY_HEIGHT / 2, eastCenter]}
        material={sandstone}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[WALL, GALLERY_HEIGHT, eastLen]} />
      </mesh>
      <mesh
        position={[-HALF_X, GALLERY_HEIGHT / 2, -eastCenter]}
        material={sandstone}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[WALL, GALLERY_HEIGHT, eastLen]} />
      </mesh>
      <mesh
        position={[-HALF_X, (GALLERY_HEIGHT + DOOR_H) / 2, 0]}
        material={sandstone}
        castShadow
      >
        <boxGeometry args={[WALL, GALLERY_HEIGHT - DOOR_H, DOOR_W + 0.08]} />
      </mesh>
      <mesh position={[-HALF_X, DOOR_H / 2, DOOR_W / 2]} material={sandstone} castShadow receiveShadow>
        <boxGeometry args={[WALL + 0.02, DOOR_H, 0.14]} />
      </mesh>
      <mesh position={[-HALF_X, DOOR_H / 2, -DOOR_W / 2]} material={sandstone} castShadow receiveShadow>
        <boxGeometry args={[WALL + 0.02, DOOR_H, 0.14]} />
      </mesh>
      <mesh position={[-HALF_X, DOOR_H, 0]} material={sandstone} castShadow>
        <boxGeometry args={[WALL + 0.02, 0.14, DOOR_W + 0.14]} />
      </mesh>

      <mesh position={[-HALF_X - 0.14, DOOR_H / 2, -(DOOR_W / 2)]} material={galleryTrim} castShadow>
        <boxGeometry args={[0.16, DOOR_H + 0.18, 0.2]} />
      </mesh>
      <mesh position={[-HALF_X - 0.14, DOOR_H / 2, DOOR_W / 2]} material={galleryTrim} castShadow>
        <boxGeometry args={[0.16, DOOR_H + 0.18, 0.2]} />
      </mesh>
      <mesh position={[-HALF_X - 0.14, DOOR_H + 0.08, 0]} material={galleryTrim} castShadow>
        <boxGeometry args={[0.18, 0.2, DOOR_W + 0.4]} />
      </mesh>
      <mesh position={[-HALF_X - 0.12, 0.05, 0]} material={creamStone} receiveShadow>
        <boxGeometry args={[0.32, 0.12, DOOR_W + 0.36]} />
      </mesh>
      {[-1.58, 1.58].map((z) => (
        <mesh key={z} position={[-HALF_X - 0.2, 1.55, z]} material={creamStone} castShadow>
          <boxGeometry args={[0.28, 3.1, 0.28]} />
        </mesh>
      ))}
      <mesh position={[-HALF_X - 0.22, DOOR_H + 0.62, 0]} material={doorWood} castShadow>
        <boxGeometry args={[0.12, 0.56, 3.15]} />
      </mesh>
      <mesh position={[-HALF_X - 0.29, DOOR_H + 0.62, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[2.95, 0.46]} />
        <meshStandardMaterial map={signMap} roughness={0.45} metalness={0.04} />
      </mesh>

      {[
        [-HALF_X - 0.16, 2.15, -3.55],
        [-HALF_X - 0.16, 2.15, 3.55],
      ].map(([x, wy, z]) => (
        <group key={`${z}`}>
          <mesh position={[x, wy, z]} material={windowFrame} castShadow>
            <boxGeometry args={[0.12, 2.05, 1.55]} />
          </mesh>
          <mesh position={[x - 0.04, wy, z]} material={glass}>
            <boxGeometry args={[0.06, 1.78, 1.28]} />
          </mesh>
        </group>
      ))}

      {[0.35, 0.7, 1.05].map((step, i) => (
        <mesh
          key={step}
          position={[-HALF_X - 0.55 - i * 0.38, 0.08 + i * 0.07, 0]}
          material={creamStone}
          receiveShadow
        >
          <boxGeometry args={[0.42, 0.16, 3.4 - i * 0.15]} />
        </mesh>
      ))}

      <Suspense fallback={null}>
        <GalleryDoors hall={hall} />
      </Suspense>
      <HallExit hall={hall} />

      <mesh position={[HALF_X - 0.18, GALLERY_HEIGHT / 2, 0]} material={museumWall}>
        <boxGeometry args={[0.22, GALLERY_HEIGHT - 0.12, GALLERY_SIZE_Z - 0.28]} />
      </mesh>
      <mesh position={[0, GALLERY_HEIGHT / 2, HALF_Z - 0.18]} material={museumWall}>
        <boxGeometry args={[GALLERY_SIZE_X - 0.28, GALLERY_HEIGHT - 0.12, 0.22]} />
      </mesh>
      <mesh position={[0, GALLERY_HEIGHT / 2, -HALF_Z + 0.18]} material={museumWall}>
        <boxGeometry args={[GALLERY_SIZE_X - 0.28, GALLERY_HEIGHT - 0.12, 0.22]} />
      </mesh>
      <mesh position={[-HALF_X + 0.18, GALLERY_HEIGHT / 2, eastCenter]} material={museumWall}>
        <boxGeometry args={[0.22, GALLERY_HEIGHT - 0.12, eastLen - 0.08]} />
      </mesh>
      <mesh position={[-HALF_X + 0.18, GALLERY_HEIGHT / 2, -eastCenter]} material={museumWall}>
        <boxGeometry args={[0.22, GALLERY_HEIGHT - 0.12, eastLen - 0.08]} />
      </mesh>
      <mesh
        position={[-HALF_X + 0.18, (GALLERY_HEIGHT + DOOR_H) / 2, 0]}
        material={museumWall}
      >
        <boxGeometry args={[0.22, GALLERY_HEIGHT - DOOR_H, DOOR_W + 0.14]} />
      </mesh>
      {[
        [HALF_X - 0.28, HALF_Z - 0.28],
        [HALF_X - 0.28, -HALF_Z + 0.28],
        [-HALF_X + 0.28, HALF_Z - 0.28],
        [-HALF_X + 0.28, -HALF_Z + 0.28],
      ].map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, GALLERY_HEIGHT / 2, z]} material={museumWall}>
          <boxGeometry args={[0.32, GALLERY_HEIGHT - 0.1, 0.32]} />
        </mesh>
      ))}

      <mesh position={[0, 0.28, HALF_Z - 0.3]} material={museumBaseboard}>
        <boxGeometry args={[GALLERY_SIZE_X - 0.55, 0.16, 0.08]} />
      </mesh>
      <mesh position={[0, 0.28, -HALF_Z + 0.3]} material={museumBaseboard}>
        <boxGeometry args={[GALLERY_SIZE_X - 0.55, 0.16, 0.08]} />
      </mesh>
      <mesh position={[HALF_X - 0.3, 0.28, 0]} material={museumBaseboard}>
        <boxGeometry args={[0.08, 0.16, GALLERY_SIZE_Z - 0.55]} />
      </mesh>
      <mesh position={[-HALF_X + 0.3, 0.28, eastCenter]} material={museumBaseboard}>
        <boxGeometry args={[0.08, 0.16, eastLen - 0.2]} />
      </mesh>
      <mesh position={[-HALF_X + 0.3, 0.28, -eastCenter]} material={museumBaseboard}>
        <boxGeometry args={[0.08, 0.16, eastLen - 0.2]} />
      </mesh>

      <mesh position={[0, 0.42, 0]} material={museumBaseboard} receiveShadow>
        <boxGeometry args={[1.7, 0.42, 0.42]} />
      </mesh>
      {hall === "awards" ? <AwardsHiddenLighting lit={hallLit} /> : null}

      <Suspense fallback={null}>
        {(hall === "awards" ? awardFrameSlots(pieces.length) : museumFrameSlots(pieces.length)).map(
          (slot, index) => {
            const piece = pieces[slot.pieceIndex ?? index];
            if (!piece) return null;
            return (
              <ProjectFrame
                key={`${piece.id}-${index}`}
                hall={hall}
                piece={piece}
                position={slot.position}
                rotation={slot.rotation}
                scale={slot.scale}
                tiny={slot.tiny}
              />
            );
          },
        )}
      </Suspense>
    </group>
  );
}
