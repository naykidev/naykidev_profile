import { useMemo } from "react";
import { BufferAttribute, Color, PlaneGeometry } from "three";
import { coastHeight, coastHeightFar, hash2, shoreXAt } from "./noise";
import { dirtRut, neighborhoodDeck, onPavement } from "./townLayout";

function makePlayableLand(width: number, depth: number, segX: number, segZ: number) {
  const geo = new PlaneGeometry(width, depth, segX, segZ);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const lush = new Color(0x7eb056);
  const hill = new Color(0x6a9c48);
  const sunlit = new Color(0x96c46a);
  const sand = new Color(0xe8d7a8);
  const wet = new Color(0xd4c08a);
  const dirt = new Color(0xc4a070);
  const dirtMid = new Color(0xb08958);
  const dirtRutColor = new Color(0x8c6238);
  const mixed = new Color();
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const road = onPavement(x, z);
    let h = coastHeight(x, z);
    if (road > 0.02) {
      const deck = neighborhoodDeck(x);
      h = h * (1 - road * 0.9) + deck * (road * 0.9);
      h -= road * 0.07 + dirtRut(x, z) * 0.05;
    }
    pos.setY(i, h);
    const n = hash2(x * 0.37, z * 0.33);
    const edge = shoreXAt(z);
    if (x > edge + 0.4) mixed.copy(sand).lerp(wet, n * 0.35);
    else if (x > edge - 1.6) mixed.copy(sand).lerp(sunlit, 0.2);
    else mixed.copy(hill).lerp(lush, n).lerp(sunlit, n * 0.35);
    if (road > 0.08) {
      mixed.lerp(dirt, Math.min(1, (road - 0.08) / 0.45));
      mixed.lerp(dirtMid, n * 0.45);
      mixed.lerp(dirtRutColor, dirtRut(x, z) * 0.75);
    }
    colors[i * 3] = mixed.r;
    colors[i * 3 + 1] = mixed.g;
    colors[i * 3 + 2] = mixed.b;
  }
  geo.setAttribute("color", new BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

/** Large low-detail skirt — continues the coast so the camera never sees a mesh cliff. */
function makeSurroundLand(width: number, depth: number, segX: number, segZ: number) {
  const geo = new PlaneGeometry(width, depth, segX, segZ);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const lush = new Color(0x6f9e4e);
  const hill = new Color(0x5f8a42);
  const ridge = new Color(0x7a9270);
  const sand = new Color(0xdccfa0);
  const haze = new Color(0xb8c8b0);
  const mixed = new Color();
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    // Sit under the detailed playable mesh to avoid z-fight / hard skirts
    const inCore = Math.abs(x) < 82 && Math.abs(z) < 72;
    let h = coastHeightFar(x, z);
    if (inCore) {
      h = Math.min(h, coastHeight(x, z) - 0.55);
    }
    pos.setY(i, h);
    const n = hash2(x * 0.11, z * 0.09);
    const edge = shoreXAt(z);
    const dist = Math.sqrt(x * x + z * z);
    const hazeT = Math.min(1, Math.max(0, (dist - 90) / 140));
    if (x > edge + 1) mixed.copy(sand).lerp(haze, 0.25 + n * 0.2);
    else mixed.copy(hill).lerp(lush, n * 0.55).lerp(ridge, Math.min(1, Math.max(0, -x / 80)));
    mixed.lerp(haze, hazeT * 0.65);
    colors[i * 3] = mixed.r;
    colors[i * 3 + 1] = mixed.g;
    colors[i * 3 + 2] = mixed.b;
  }
  geo.setAttribute("color", new BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

export function Terrain() {
  const coarse =
    typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const land = useMemo(
    () => makePlayableLand(170, 150, coarse ? 72 : 110, coarse ? 60 : 96),
    [coarse],
  );
  const surround = useMemo(
    () => makeSurroundLand(520, 480, coarse ? 48 : 72, coarse ? 42 : 64),
    [coarse],
  );
  return (
    <group>
      <mesh geometry={surround} frustumCulled={false}>
        <meshLambertMaterial vertexColors flatShading />
      </mesh>
      <mesh geometry={land}>
        <meshLambertMaterial vertexColors flatShading />
      </mesh>
    </group>
  );
}
