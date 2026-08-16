import { locations } from "@/data/locations";
import { useAppStore } from "@/systems/store";

export function findNearby(x: number, y: number, z: number) {
  const interior = useAppStore.getState().interior;
  let best = null as (typeof locations)[number] | null;
  let bestDist = Infinity;
  const eyeY = y + 1.62;
  for (const location of locations) {
    if (interior === "gallery" && location.id !== "gallery-exit") continue;
    if (interior === "awards" && location.id !== "awards-exit") continue;
    if (interior !== "gallery" && location.id === "gallery-exit") continue;
    if (interior !== "awards" && location.id === "awards-exit") continue;
    if (location.id === "interests" || location.id === "arcade" || location.id === "axol") continue;
    const dx = x - location.position[0];
    const dy = eyeY - location.position[1];
    const dz = z - location.position[2];
    const planar = Math.hypot(dx, dz);
    const dist = Math.hypot(dx, dy, dz);
    const reach = location.radius * 1.22;
    if (planar < location.radius && dist < reach && dist < bestDist) {
      best = location;
      bestDist = dist;
    }
  }
  return best;
}

export function interactLocation(id: string) {
  const state = useAppStore.getState();
  if (state.galleryProjectId || state.activePanel || state.cameraTransition) return;
  if (id === "projects-gallery") {
    if (!state.interior) state.enterGallery();
    return;
  }
  if (id === "awards-gallery") {
    if (!state.interior) state.enterAwards();
    return;
  }
  if (id === "gallery-exit" || id === "awards-exit") {
    state.exitGallery();
    return;
  }
  const location = locations.find((item) => item.id === id);
  if (location) state.openPanel(location.panel);
}

export function tryInteract() {
  const { nearby } = useAppStore.getState();
  if (!nearby) return;
  interactLocation(nearby.id);
}
