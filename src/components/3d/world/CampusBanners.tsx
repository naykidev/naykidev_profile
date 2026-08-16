import { DoubleSide } from "three";
import { galleryApproachContains, galleryFootprintContains, GALLERY_Z } from "@/systems/campusLayout";
import { getTerrainHeight } from "@/systems/terrain";
import { nailHead, timber } from "./materials";
import { galleryWayfindAmpersandMap, galleryWayfindAwardsMap, galleryWayfindCertificatesMap, galleryWayfindGalleryMap, galleryWayfindProjectsMap, wBannerMap } from "./textures";

const BANNER_Z = [32, 22, 12, 2, -8];

function BannerPost({ x, z }: { x: number; z: number }) {
  const y = getTerrainHeight(x, z);
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 1.55, 0]} material={timber} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 3.1, 8]} />
      </mesh>
      <mesh position={[x > 0 ? -0.4 : 0.4, 2.15, 0]} rotation={[0, x > 0 ? -0.15 : 0.15, 0]}>
        <planeGeometry args={[0.72, 1.55]} />
        <meshStandardMaterial
          map={wBannerMap}
          roughness={0.55}
          metalness={0.04}
          side={DoubleSide}
        />
      </mesh>
    </group>
  );
}

const SIGN_POST_X = 0.5;
const SIGN_POST_RADIUS = 0.062;
const PLANK_DEPTH = 0.05;
const PLANK_WIDTH = SIGN_POST_X * 2 + SIGN_POST_RADIUS * 1.35;
const PLANK_HEIGHT = 0.28;

function SignPlank({
  y,
  map,
}: {
  y: number;
  map: typeof galleryWayfindProjectsMap;
}) {
  const frontZ = SIGN_POST_RADIUS + PLANK_DEPTH / 2 + 0.004;
  const nails: [number, number][] = [
    [-SIGN_POST_X, PLANK_HEIGHT / 2 - 0.065],
    [SIGN_POST_X, PLANK_HEIGHT / 2 - 0.065],
    [-SIGN_POST_X, -PLANK_HEIGHT / 2 + 0.065],
    [SIGN_POST_X, -PLANK_HEIGHT / 2 + 0.065],
  ];
  return (
    <group position={[0, y, frontZ]}>
      <mesh castShadow>
        <boxGeometry args={[PLANK_WIDTH, PLANK_HEIGHT, PLANK_DEPTH]} />
        <meshStandardMaterial color="#b57a45" roughness={0.78} metalness={0.02} />
      </mesh>
      <mesh position={[0, 0, PLANK_DEPTH / 2 + 0.002]}>
        <planeGeometry args={[PLANK_WIDTH - 0.06, PLANK_HEIGHT - 0.05]} />
        <meshStandardMaterial
          map={map}
          roughness={0.7}
          metalness={0.03}
          envMapIntensity={0.12}
        />
      </mesh>
      {nails.map(([nx, ny]) => (
        <mesh key={`${nx}-${ny}`} position={[nx, ny, PLANK_DEPTH / 2 + 0.01]} material={nailHead} castShadow>
          <sphereGeometry args={[0.016, 10, 8]} />
        </mesh>
      ))}
    </group>
  );
}

function GalleryWayfindSign() {
  const x = 5.22;
  const z = GALLERY_Z + 2.55;
  const y = getTerrainHeight(x, z);
  return (
    <group position={[x, y, z]} rotation={[0, -0.62, 0]} scale={1.18}>
      {[-SIGN_POST_X, SIGN_POST_X].map((px) => (
        <mesh key={px} position={[px, 0.92, 0]} material={timber} castShadow>
          <cylinderGeometry args={[0.05, SIGN_POST_RADIUS, 1.92, 12]} />
        </mesh>
      ))}
      <SignPlank y={1.48} map={galleryWayfindProjectsMap} />
      <SignPlank y={1.14} map={galleryWayfindGalleryMap} />
    </group>
  );
}

export function CampusBanners() {
  return (
    <group>
      {BANNER_Z.map((z) => (
        <BannerPost key={`l-${z}`} x={-8.6} z={z} />
      ))}
      {BANNER_Z.map((z) => (
        <BannerPost key={`r-${z}`} x={8.6} z={z} />
      ))}
      <GalleryWayfindSign />
      <group position={[-5.22, getTerrainHeight(-5.22, GALLERY_Z + 2.55), GALLERY_Z + 2.55]} rotation={[0, 0.62, 0]} scale={1.18}>
        {[-SIGN_POST_X, SIGN_POST_X].map((px) => (
        <mesh key={px} position={[px, 0.98, 0]} material={timber} castShadow>
          <cylinderGeometry args={[0.05, SIGN_POST_RADIUS, 2.04, 12]} />
        </mesh>
        ))}
        <SignPlank y={1.62} map={galleryWayfindAwardsMap} />
        <SignPlank y={1.30} map={galleryWayfindAmpersandMap} />
        <SignPlank y={0.98} map={galleryWayfindCertificatesMap} />
      </group>
    </group>
  );
}

export function FramingGroves() {
  const spots: [number, number][] = [];
  for (let i = 0; i < 14; i += 1) {
    spots.push([-16.5 - (i % 3) * 1.8, -12 + i * 4.1]);
    spots.push([16.8 + (i % 3) * 1.7, -11 + i * 4.05]);
  }
  return (
    <group>
      {spots
        .filter(([x, z]) => !galleryFootprintContains(x, z) && !galleryApproachContains(x, z))
        .map(([x, z], i) => {
        const y = getTerrainHeight(x, z);
        const s = 1.05 + (i % 4) * 0.12;
        return (
          <group key={`${x}-${z}`} position={[x, y, z]} scale={s}>
            <mesh position={[0, 1.3, 0]} material={timber} castShadow>
              <cylinderGeometry args={[0.22, 0.32, 2.6, 6]} />
            </mesh>
            <mesh position={[0, 3.6, 0]} castShadow>
              <icosahedronGeometry args={[2.15, 1]} />
              <meshStandardMaterial color={i % 2 ? "#2f5a3a" : "#3f6e46"} roughness={0.95} />
            </mesh>
            <mesh position={[0.8, 2.7, 0.4]} castShadow>
              <icosahedronGeometry args={[1.35, 1]} />
              <meshStandardMaterial color="#345f3d" roughness={0.95} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
