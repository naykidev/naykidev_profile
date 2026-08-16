import { useMemo } from "react";
import { BufferAttribute, Color, PlaneGeometry } from "three";
import {
  GALLERY_Z,
  TERRACE_FRONT_Z,
  TERRACE_SURFACE,
  TERRACE_Y,
  galleryDoorX,
} from "@/systems/campusLayout";
import { getTerrainHeight } from "@/systems/terrain";
import { limestone, limestoneSpur } from "./materials";

export function Terrain() {
  const hill = useMemo(() => {
    const geometry = new PlaneGeometry(120, 140, 72, 84);
    geometry.rotateX(-Math.PI / 2);
    const position = geometry.attributes.position;
    const colors = new Float32Array(position.count * 3);
    const a = new Color("#4d7353");
    const b = new Color("#6d8a55");
    const c = new Color("#3a5c42");
    const mix = new Color();
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const z = position.getZ(i);
      const y = getTerrainHeight(x, z);
      position.setY(i, y);
      const t = Math.max(0, Math.min(1, y / 5.2));
      mix.copy(c).lerp(a, t).lerp(b, Math.min(1, Math.abs(x) / 70));
      colors[i * 3] = mix.r;
      colors[i * 3 + 1] = mix.g;
      colors[i * 3 + 2] = mix.b;
    }
    geometry.setAttribute("color", new BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  return (
    <mesh geometry={hill} receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.95} metalness={0} />
    </mesh>
  );
}

export function MallPaths() {
  const path = useMemo(() => {
    const geometry = new PlaneGeometry(7.4, 78, 1, 48);
    geometry.rotateX(-Math.PI / 2);
    const position = geometry.attributes.position;
    for (let i = 0; i < position.count; i++) {
      const z = position.getZ(i);
      position.setY(i, getTerrainHeight(0, z) + 0.045);
    }
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  const cross = useMemo(() => {
    const geometry = new PlaneGeometry(36, 6.2, 24, 1);
    geometry.rotateX(-Math.PI / 2);
    const position = geometry.attributes.position;
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      position.setZ(i, -6.2);
      position.setY(i, getTerrainHeight(x, -6.2) + 0.05);
    }
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  const gallerySpur = useMemo(() => {
    const startX = 2.55;
    const endX = galleryDoorX() - 0.72;
    const length = endX - startX;
    const midX = (startX + endX) / 2;
    const geometry = new PlaneGeometry(length, 3.05, 36, 4);
    geometry.rotateX(-Math.PI / 2);
    const position = geometry.attributes.position;
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i) + midX;
      const z = position.getZ(i) + GALLERY_Z;
      position.setX(i, x);
      position.setZ(i, z);
      position.setY(i, getTerrainHeight(x, z) + 0.055);
    }
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  return (
    <group>
      <mesh geometry={path} material={limestone} receiveShadow />
      <mesh geometry={cross} material={limestone} receiveShadow />
      <mesh geometry={gallerySpur} material={limestoneSpur} receiveShadow />
      <mesh
        geometry={gallerySpur}
        material={limestoneSpur}
        scale={[-1, 1, 1]}
        receiveShadow
      />
      <mesh
        position={[3.35, getTerrainHeight(3.35, GALLERY_Z) + 0.062, GALLERY_Z]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={limestoneSpur}
        receiveShadow
      >
        <circleGeometry args={[1.85, 24]} />
      </mesh>
      <mesh
        position={[-3.35, getTerrainHeight(-3.35, GALLERY_Z) + 0.062, GALLERY_Z]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={limestoneSpur}
        receiveShadow
      >
        <circleGeometry args={[1.85, 24]} />
      </mesh>
      {[-16, -8, 8, 16, 28, 40].map((z) => (
        <mesh
          key={z}
          position={[0, getTerrainHeight(0, z) + 0.06, z]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={limestone}
          receiveShadow
        >
          <circleGeometry args={[2.1, 24]} />
        </mesh>
      ))}
      {Array.from({ length: 22 }, (_, i) => {
        const t = i / 21;
        const z = 6.2 + (TERRACE_FRONT_Z + 0.28 - 6.2) * t;
        const approach = Math.min(1, Math.max(0, (6.2 - z) / (6.2 - TERRACE_FRONT_Z)));
        const y =
          getTerrainHeight(0, z) * (1 - approach * approach) +
          (TERRACE_Y + TERRACE_SURFACE - 0.03) * approach * approach +
          0.02;
        return (
          <mesh
            key={`step-${i}`}
            position={[0, y, z]}
            material={limestone}
            receiveShadow
            castShadow
          >
            <boxGeometry args={[9.2, 0.14, 0.62]} />
          </mesh>
        );
      })}
    </group>
  );
}
