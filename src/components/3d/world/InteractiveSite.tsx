import { type ReactNode } from "react";
import { interactLocation } from "@/systems/interaction";
import { wasLookDrag } from "@/systems/lookDrag";
import { useAppStore } from "@/systems/store";

export function InteractiveSite({
  locationId,
  children,
}: {
  locationId: string;
  children: ReactNode;
}) {
  const mode = useAppStore((s) => s.mode);
  const pointerLocked = useAppStore((s) => s.pointerLocked);
  const interior = useAppStore((s) => s.interior);

  const selfInterior =
    (locationId === "projects-gallery" && interior === "gallery") ||
    (locationId === "awards-gallery" && interior === "awards");
  const interactive = mode === "explore" && !pointerLocked && !selfInterior;

  return (
    <group
      onPointerOver={(event) => {
        if (!interactive) return;
        event.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
      onClick={(event) => {
        if (!interactive || wasLookDrag()) return;
        event.stopPropagation();
        interactLocation(locationId);
      }}
    >
      {children}
    </group>
  );
}
