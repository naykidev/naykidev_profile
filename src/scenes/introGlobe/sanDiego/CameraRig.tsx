import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { PerspectiveCamera, Vector3 } from "three";
import { readIntroPlayback } from "@/hooks/useIntroSequence";

const look = new Vector3();

function smooth(t: number) {
  const u = Math.min(1, Math.max(0, t));
  return u * u * (3 - 2 * u);
}

/** High wide aerial over rolling hills toward the Pacific — then lift into the globe. */
export function CameraRig({
  elapsed = 0,
  fade = 1,
  followIntro = false,
}: {
  elapsed?: number;
  fade?: number;
  followIntro?: boolean;
}) {
  const elapsedRef = useRef(elapsed);
  const fadeRef = useRef(fade);
  elapsedRef.current = elapsed;
  fadeRef.current = fade;

  useFrame(({ camera }) => {
    let t = elapsedRef.current;
    let f = fadeRef.current;
    if (followIntro) {
      const sample = readIntroPlayback();
      t = sample.sdElapsed;
      f = sample.sdFade;
    }
    t = Math.max(0, t);
    const drift = smooth(t / 2.15);
    const lift = smooth((1 - f) * 1.45);
    camera.position.set(
      -26 + drift * 4 + lift * 8,
      22 + drift * 3 + lift * 36,
      18 - drift * 3 - lift * 6,
    );
    look.set(10 + drift * 6 + lift * 18, -1.2 + lift * 10, -2 - drift * 2);
    camera.lookAt(look);
    const persp = camera as PerspectiveCamera;
    const nextFov = 50 + lift * 6;
    if (Math.abs(persp.fov - nextFov) > 0.04) {
      persp.fov = nextFov;
      persp.updateProjectionMatrix();
    }
  });
  return null;
}
