import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AxolotlMascot } from "./AxolotlMascot";

const MOBILE_CLAMP_IDS = new Set(["accessibility-surfer", "axol-work"]);
const MOBILE_MQ = "(max-width: 640px)";

/** Keep the mascot inside the portrait edges on small screens. */
const MOBILE_EDGE_INSET_PX = 8;

export function AxolotlPortraitFloat({
  reduce,
  projectId,
}: {
  reduce: boolean;
  projectId: string;
}) {
  const laneRef = useRef<HTMLDivElement>(null);
  const [travelPx, setTravelPx] = useState(0);
  const mobileClamp = MOBILE_CLAMP_IDS.has(projectId);

  useEffect(() => {
    const lane = laneRef.current;
    if (!lane) return;

    const updateTravel = () => {
      const mascot = lane.querySelector<HTMLElement>("[data-axolotl-mascot]");
      const laneHeight = lane.clientHeight;
      const mascotHeight = mascot?.offsetHeight ?? 0;
      const isMobile = window.matchMedia(MOBILE_MQ).matches;
      const inset = mobileClamp && isMobile ? MOBILE_EDGE_INSET_PX : 0;
      setTravelPx(Math.max(0, laneHeight - mascotHeight - inset * 2));
    };

    updateTravel();

    const ro = new ResizeObserver(updateTravel);
    ro.observe(lane);

    const mascot = lane.querySelector<HTMLElement>("[data-axolotl-mascot]");
    if (mascot) ro.observe(mascot);

    const img = lane.parentElement?.querySelector("img");
    if (img) {
      if (img.complete) updateTravel();
      else img.addEventListener("load", updateTravel);
    }

    const mq = window.matchMedia(MOBILE_MQ);
    mq.addEventListener("change", updateTravel);

    return () => {
      ro.disconnect();
      img?.removeEventListener("load", updateTravel);
      mq.removeEventListener("change", updateTravel);
    };
  }, [mobileClamp]);

  const mascotStyle = {
    "--float-travel": `${travelPx}px`,
  } as CSSProperties;

  return (
    <div
      ref={laneRef}
      className={`axolotl-float-lane axolotl-float-lane--portrait${mobileClamp ? " axolotl-float-lane--mobile-clamp" : ""}`}
      aria-hidden
    >
      <div
        data-axolotl-mascot
        style={mascotStyle}
        className={
          reduce
            ? `axolotl-float-lane__mascot--portrait${mobileClamp ? " axolotl-float-lane__mascot--mobile-clamp" : ""}`
            : `axolotl-float-lane__mascot--portrait axolotl-float--portrait${mobileClamp ? " axolotl-float-lane__mascot--mobile-clamp" : ""}`
        }
      >
        <AxolotlMascot />
      </div>
    </div>
  );
}
