import { useEffect } from "react";

const keys = new Set<string>();

export function isKeyDown(code: string): boolean {
  return keys.has(code);
}

export function useKeyboard() {
  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      keys.add(event.code);
    };
    const up = (event: KeyboardEvent) => {
      keys.delete(event.code);
    };
    const blur = () => keys.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);
}

export function movementFromKeys(): { x: number; z: number } {
  let x = 0;
  let z = 0;
  if (keys.has("KeyW") || keys.has("ArrowUp")) z -= 1;
  if (keys.has("KeyS") || keys.has("ArrowDown")) z += 1;
  if (keys.has("KeyA") || keys.has("ArrowLeft")) x -= 1;
  if (keys.has("KeyD") || keys.has("ArrowRight")) x += 1;
  return { x, z };
}

export function interactPressed(): boolean {
  return keys.has("KeyE") || keys.has("Enter");
}

export function escapePressed(): boolean {
  return keys.has("Escape");
}
