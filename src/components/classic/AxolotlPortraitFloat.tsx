import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AxolotlMascot } from "./AxolotlMascot";

export function AxolotlPortraitFloat({ reduce }: { reduce: boolean }) {
  const laneRef = useRef<HTMLDivElement>(null);
  const [travelPx, setTravelPx] = useState(0);

  useEffect(() => {
    const lane = laneRef.current;
    if (!lane) return;

    const updateTravel = () => {
      const mascot = lane.querySelector<HTMLElement>("[data-axolotl-mascot]");
      const laneHeight = lane.clientHeight;
      const mascotHeight = mascot?.offsetHeight ?? 0;
      setTravelPx(Math.max(0, laneHeight - mascotHeight));
    };

    updateTravel();

    const ro = new ResizeObserver(updateTravel);
    ro.observe(lane);

    const img = lane.parentElement?.querySelector("img");
    if (img) {
      if (img.complete) updateTravel();
      else img.addEventListener("load", updateTravel);
    }

    return () => {
      ro.disconnect();
      img?.removeEventListener("load", updateTravel);
    };
  }, []);

  const mascotStyle = {
    "--float-travel": `${travelPx}px`,
  } as CSSProperties;

  return (
    <div ref={laneRef} className="axolotl-float-lane axolotl-float-lane--portrait" aria-hidden>
      <div
        data-axolotl-mascot
        style={mascotStyle}
        className={
          reduce
            ? "axolotl-float-lane__mascot--portrait"
            : "axolotl-float-lane__mascot--portrait axolotl-float--portrait"
        }
      >
        <AxolotlMascot />
      </div>
    </div>
  );
}
