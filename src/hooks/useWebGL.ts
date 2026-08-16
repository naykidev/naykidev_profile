import { useEffect, useState } from "react";

export function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl"),
    );
  } catch {
    return false;
  }
}

export function useWebGLSupport(): boolean {
  const [ok, setOk] = useState(true);
  useEffect(() => {
    setOk(detectWebGL());
  }, []);
  return ok;
}
