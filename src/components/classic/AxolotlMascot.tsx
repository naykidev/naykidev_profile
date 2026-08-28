import { asset } from "@/lib/asset";

const AXOLOTL_GIF = asset("/textures/axolotl-mascot.gif");

export function AxolotlMascot({ className = "" }: { className?: string }) {
  return (
    <img
      src={AXOLOTL_GIF}
      alt=""
      aria-hidden
      className={`axolotl-gif h-auto w-full ${className}`}
    />
  );
}
