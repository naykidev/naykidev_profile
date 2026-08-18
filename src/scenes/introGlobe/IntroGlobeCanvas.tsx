/**
 * Isolated globe intro layer using globe.gl (own WebGL canvas, not the campus scene).
 * Preview: /?preview=globe
 */
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { readIntroPlayback, subscribeIntroPlayback } from "@/hooks/useIntroSequence";
import Globe, { type GlobeInstance } from "globe.gl";
import {
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  Mesh,
  MeshPhongMaterial,
  Points,
  PointsMaterial,
  SphereGeometry,
  TextureLoader,
} from "three";
import { asset } from "@/lib/asset";
import {
  globeBeatAt,
  GLOBE_BEAT_DURATION,
  JOURNEY_ARC,
  type GlobeBeatId,
} from "./globeTimeline";

function makeLabelEl(text: string) {
  const el = document.createElement("div");
  el.className =
    "pointer-events-none bg-ink/85 px-2 py-1 font-ui text-[10px] tracking-[0.28em] text-paper uppercase";
  el.textContent = text;
  return el;
}

function addStarfield() {
  const count = 1800;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const palette = [
    new Color("#f4ece0"),
    new Color("#d7e6f4"),
    new Color("#9ec5ea"),
    new Color("#ffe0a8"),
    new Color("#ffffff"),
  ];
  for (let i = 0; i < count; i += 1) {
    const far = Math.random() ** 0.45;
    const radius = 420 + far * 620;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.cos(phi);
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    const c = palette[i % palette.length];
    const dim = 0.5 + Math.random() * 0.5;
    colors[i * 3] = c.r * dim;
    colors[i * 3 + 1] = c.g * dim;
    colors[i * 3 + 2] = c.b * dim;
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("color", new BufferAttribute(colors, 3));
  const material = new PointsMaterial({
    size: 1.8,
    vertexColors: true,
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
    sizeAttenuation: true,
  });
  return new Points(geometry, material);
}

function addMoon() {
  const geometry = new SphereGeometry(27, 48, 32);
  const material = new MeshPhongMaterial({
    color: "#ffffff",
    shininess: 2,
    specular: new Color("#222222"),
    emissive: new Color("#1a1612"),
    emissiveIntensity: 0.18,
  });
  new TextureLoader().load(asset("/intro/moon.jpg"), (map) => {
    material.map = map;
    material.needsUpdate = true;
  });
  const moon = new Mesh(geometry, material);
  moon.name = "introMoon";
  return moon;
}

function applyBeat(
  globe: GlobeInstance,
  elapsed: number,
  lastId: { current: GlobeBeatId | null },
  liftOff = false,
) {
  const beat = globeBeatAt(elapsed, { liftOff });
  if (beat.id === lastId.current) return;
  const instant = lastId.current === null;
  lastId.current = beat.id;

  globe.controls().autoRotate = beat.autoRotate;
  globe.pointOfView(beat.pov, instant ? 0 : beat.transitionMs);
  globe.pointsData(beat.pins);
  globe.htmlElementsData(beat.pins);
  globe.arcsData(beat.showArc ? [JOURNEY_ARC] : []);
}

function createGlobe(el: HTMLElement) {
  const globe = new Globe(el, { animateIn: false, waitForGlobeReady: true })
    .width(el.clientWidth)
    .height(el.clientHeight)
    .backgroundColor("#03060d")
    .backgroundImageUrl(asset("/intro/night-sky.png"))
    .showGlobe(true)
    .showAtmosphere(true)
    .atmosphereColor("#6eb0e8")
    .atmosphereAltitude(0.22)
    .globeImageUrl(asset("/intro/earth-blue-marble.jpg"))
    .bumpImageUrl(asset("/intro/earth-topology.png"))
    .polygonsData([])
    .polygonCapColor(() => "rgba(0,0,0,0)")
    .polygonSideColor(() => "rgba(0,0,0,0)")
    .polygonStrokeColor((d) =>
      (d as { properties?: { postal?: string } }).properties?.postal
        ? "rgba(255,236,210,0.7)"
        : "rgba(236,246,255,0.28)",
    )
    .polygonAltitude(0.0012)
    .polygonsTransitionDuration(0)
    .pointColor(() => "#c5050c")
    .pointAltitude(0.02)
    .pointRadius(0.42)
    .pointLabel(() => "")
    .arcColor(() => ["#c5050c", "#f4a261", "#f4ece0"])
    .arcStroke(0.65)
    .arcAltitude(0.22)
    .arcDashLength(0.45)
    .arcDashGap(0.18)
    .arcDashAnimateTime(1400)
    .htmlLat("lat")
    .htmlLng("lng")
    .htmlAltitude(0.04)
    .htmlElement((d) => makeLabelEl((d as { label: string }).label))
    .htmlElementVisibilityModifier((el, isVisible) => {
      el.style.opacity = isVisible ? "1" : "0";
    })
    .enablePointerInteraction(false);

  const mat = globe.globeMaterial() as MeshPhongMaterial;
  mat.color = new Color("#ffffff");
  mat.emissive = new Color("#0a1520");
  mat.emissiveIntensity = 0.12;
  mat.shininess = 18;
  mat.specular = new Color("#89c4e8");
  new TextureLoader().load(asset("/intro/earth-water.png"), (water) => {
    mat.specularMap = water;
    mat.needsUpdate = true;
  });

  const fill = new DirectionalLight("#fff6e8", 2.05);
  fill.position.set(2.6, 3.4, 1.8);
  const rim = new DirectionalLight("#7ea8d4", 0.55);
  rim.position.set(-2.2, 0.6, -1.8);
  globe.lights([new AmbientLight("#d7e6f4", 0.95), fill, rim]);

  const stars = addStarfield();
  globe.scene().add(stars);

  const moon = addMoon();
  const moonPos = globe.getCoords(14, -42, 2.35);
  moon.position.set(moonPos.x, moonPos.y, moonPos.z);
  globe.scene().add(moon);

  const controls = globe.controls();
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.autoRotateSpeed = 0.55;
  controls.autoRotate = true;

  globe.pointOfView({ lat: 32.72, lng: -117.45, altitude: 0.38 }, 0);
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  globe.renderer().setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1 : 1.5));
  return { globe, stars, moon };
}

async function loadPreciseLand(globe: GlobeInstance, signal: AbortSignal) {
  const [countriesRes, statesRes] = await Promise.all([
    fetch(asset("/intro/ne_110m_admin_0_countries.geojson"), { signal }),
    fetch(asset("/intro/ne_110m_us_states.geojson"), { signal }),
  ]);
  const countries = (await countriesRes.json()) as {
    features: { properties: { ISO_A3?: string } }[];
  };
  const states = (await statesRes.json()) as { features: object[] };
  const land = [
    ...countries.features.filter((feature) => feature.properties.ISO_A3 !== "USA"),
    ...states.features,
  ];
  globe.polygonsData(land);
}

const layerStyle: CSSProperties = {
  transform: "translateZ(0)",
  backfaceVisibility: "hidden",
};

function applyFade(el: HTMLElement | null, fade: number) {
  if (!el) return;
  el.style.opacity = String(fade);
}

const GLOBE_ASSETS = [
  asset("/intro/earth-blue-marble.jpg"),
  asset("/intro/earth-topology.png"),
  asset("/intro/night-sky.png"),
  asset("/intro/earth-water.png"),
  asset("/intro/moon.jpg"),
];

export function preloadIntroGlobeAssets() {
  if (typeof window === "undefined") return;
  for (const url of GLOBE_ASSETS) {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
  }
}

preloadIntroGlobeAssets();

export function IntroGlobeCanvas({
  elapsed,
  fade = 1,
  liftOff = false,
}: {
  elapsed?: number;
  fade?: number;
  liftOff?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeInstance | null>(null);
  const beatIdRef = useRef<GlobeBeatId | null>(null);
  const elapsedRef = useRef(elapsed ?? 0);
  const liftOffRef = useRef(liftOff);
  const followIntro = elapsed === undefined;
  elapsedRef.current = elapsed ?? elapsedRef.current;
  liftOffRef.current = liftOff;

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const { globe, stars, moon } = createGlobe(el);
    globeRef.current = globe;
    beatIdRef.current = null;
    const startElapsed = followIntro
      ? readIntroPlayback().globeElapsed
      : elapsedRef.current;
    applyBeat(globe, startElapsed, beatIdRef, liftOffRef.current);

    const ac = new AbortController();
    loadPreciseLand(globe, ac.signal).catch((error) => {
      if ((error as { name?: string }).name !== "AbortError") {
        console.warn("[introGlobe] failed to load country outlines", error);
      }
    });

    const ro = new ResizeObserver(() => {
      globe.width(el.clientWidth).height(el.clientHeight);
    });
    ro.observe(el);

    return () => {
      ac.abort();
      ro.disconnect();
      globe.scene().remove(stars, moon);
      stars.geometry.dispose();
      (stars.material as PointsMaterial).dispose();
      moon.geometry.dispose();
      const moonMat = moon.material as MeshPhongMaterial;
      moonMat.map?.dispose();
      moonMat.dispose();
      globe._destructor();
      globeRef.current = null;
      beatIdRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (followIntro) {
      return subscribeIntroPlayback((sample) => {
        const globe = globeRef.current;
        if (globe) applyBeat(globe, sample.globeElapsed, beatIdRef, liftOffRef.current);
        applyFade(wrapRef.current, sample.globeFade);
      });
    }
    applyFade(wrapRef.current, fade);
    const globe = globeRef.current;
    if (globe) applyBeat(globe, elapsedRef.current, beatIdRef, liftOff);
  }, [followIntro, fade, elapsed, liftOff]);

  if (!followIntro && fade <= 0.01) return null;

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none absolute inset-0 z-[54] overflow-hidden"
      style={{ ...layerStyle, opacity: followIntro ? 0 : fade }}
    >
      <div ref={hostRef} className="h-full w-full" />
    </div>
  );
}

export function IntroGlobePreview() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let id = 0;
    const start = performance.now();
    const loop = (now: number) => {
      setElapsed(((now - start) / 1000) % (GLOBE_BEAT_DURATION + 0.85));
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <>
      <IntroGlobeCanvas elapsed={elapsed} fade={1} />
      <p className="pointer-events-none absolute bottom-6 left-6 z-[55] font-ui text-[10px] tracking-[0.18em] text-ink/70 uppercase">
        Globe preview · globe.gl · not wired into intro
      </p>
    </>
  );
}

export function isGlobePreviewQuery() {
  try {
    return new URLSearchParams(window.location.search).get("preview") === "globe";
  } catch {
    return false;
  }
}
