import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera, Vector3 } from "three";

const look = new Vector3();

function smooth(t: number) {
  const u = Math.min(1, Math.max(0, t));
  return u * u * (3 - 2 * u);
}

/** High wide aerial over rolling hills toward the Pacific — then lift into the globe. */
export function CameraRig({ elapsed, fade = 1 }: { elapsed: number; fade?: number }) {
  useFrame(({ camera }) => {
    const t = Math.max(0, elapsed);
    const drift = smooth(t / 2.6);
    const lift = smooth((1 - fade) * 1.15) + smooth(Math.max(0, t - 2.15) / 1.4) * 0.5;
    camera.position.set(
      -26 + drift * 4 + lift * 8,
      22 + drift * 3 + lift * 36,
      18 - drift * 3 - lift * 6,
    );
    look.set(10 + drift * 6 + lift * 18, -1.2 + lift * 10, -2 - drift * 2);
    camera.lookAt(look);
    const persp = camera as PerspectiveCamera;
    persp.fov = 50 + lift * 6;
    persp.updateProjectionMatrix();
  });
  return null;
}
