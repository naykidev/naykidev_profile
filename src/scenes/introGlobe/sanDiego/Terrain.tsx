import { useMemo } from "react";
import { BufferAttribute, Color, PlaneGeometry } from "three";
import { coastHeight, hash2, shoreXAt } from "./noise";
import { dirtRut, neighborhoodDeck, onPavement } from "./townLayout";

function makeLayer(width: number, depth: number, segX: number, segZ: number) {
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

export function Terrain() {
  const coarse =
    typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const land = useMemo(
    () => makeLayer(170, 150, coarse ? 72 : 110, coarse ? 60 : 96),
    [coarse],
  );
  return (
    <mesh geometry={land}>
      <meshLambertMaterial vertexColors flatShading />
    </mesh>
  );
}
