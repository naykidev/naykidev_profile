import { lazy, Suspense, useEffect } from "react";
import { AccessibilityMenu } from "@/components/ui/AccessibilityMenu";
import { GalleryModal } from "@/components/ui/GalleryModal";
import { Hud } from "@/components/ui/Hud";
import { IntroCinematicLayer } from "@/components/ui/IntroJourneyOverlay";
import { IntroOverlay } from "@/components/ui/IntroOverlay";
import { TourCompleteOverlay } from "@/components/ui/TourCompleteOverlay";
import { isGlobePreviewQuery, IntroGlobePreview } from "@/scenes/introGlobe/IntroGlobeCanvas";
import { isSanDiegoPreviewQuery, SanDiegoPreview } from "@/scenes/introGlobe/SanDiegoTilesCanvas";
import { MobileControls } from "@/components/ui/MobileControls";
import { ProfilePanel } from "@/components/ui/ProfilePanel";
import { TraditionalPortfolio } from "@/components/ui/TraditionalPortfolio";
import { useKeyboard } from "@/hooks/useKeyboard";
import { usePortraitLock } from "@/hooks/usePortraitLock";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useWebGLSupport } from "@/hooks/useWebGL";
import { tryInteract } from "@/systems/interaction";
import { useAppStore } from "@/systems/store";

const CampusScene = lazy(() =>
  import("@/scenes/CampusExperience").then((mod) => ({ default: mod.CampusScene })),
);

export function App() {
  const mode = useAppStore((s) => s.mode);
  const webgl = useAppStore((s) => s.webgl);
  const highContrast = useAppStore((s) => s.highContrast);
  const setWebgl = useAppStore((s) => s.setWebgl);
  const setMode = useAppStore((s) => s.setMode);
  const closePanel = useAppStore((s) => s.closePanel);
  const activePanel = useAppStore((s) => s.activePanel);
  const galleryProjectId = useAppStore((s) => s.galleryProjectId);
  const setGalleryProject = useAppStore((s) => s.setGalleryProject);
  const interior = useAppStore((s) => s.interior);
  const exitGallery = useAppStore((s) => s.exitGallery);
  const skipIntro = useAppStore((s) => s.skipIntro);
  const supported = useWebGLSupport();

  useKeyboard();
  usePrefersReducedMotion();
  usePortraitLock();

  useEffect(() => {
    setWebgl(supported);
  }, [supported, setWebgl]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code === "Escape") {
        if (galleryProjectId) {
          setGalleryProject(null);
          return;
        }
        if (mode === "intro") {
          skipIntro();
          return;
        }
        if (mode === "tour") {
          setMode("intro");
          return;
        }
        if (interior === "gallery" || interior === "awards") {
          exitGallery();
          return;
        }
        if (activePanel) {
          closePanel();
          return;
        }
        if (document.pointerLockElement) document.exitPointerLock();
      }
      if (event.code === "KeyE" || event.code === "Enter") {
        if (mode === "explore" && !activePanel && !galleryProjectId) tryInteract();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activePanel, closePanel, exitGallery, galleryProjectId, interior, mode, setGalleryProject, setMode, skipIntro]);

  const showTraditional = mode === "traditional" || !webgl;
  const globePreview = isGlobePreviewQuery();
  const sandiegoPreview = isSanDiegoPreviewQuery();

  return (
    <div className={`relative h-full ${highContrast ? "high-contrast" : ""}`}>
      <a
        href="#traditional"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-ink focus:px-3 focus:py-2"
        onClick={(event) => {
          event.preventDefault();
          setMode("traditional");
        }}
      >
        Skip 3D experience
      </a>
      <AccessibilityMenu />
      {showTraditional ? (
        <div id="traditional" className="h-full overflow-hidden">
          <TraditionalPortfolio />
        </div>
      ) : (
        <>
          <div className="absolute inset-0 h-full w-full">
            <Suspense
              fallback={
                <div className="flex h-full items-end justify-center pb-20 font-ui text-sm tracking-[0.2em] uppercase">
                  Arriving on Bascom Hill…
                </div>
              }
            >
              {sandiegoPreview || globePreview ? null : <CampusScene />}
            </Suspense>
          </div>
          {sandiegoPreview ? (
            <SanDiegoPreview />
          ) : globePreview ? (
            <IntroGlobePreview />
          ) : (
            <>
              <IntroCinematicLayer />
              <IntroOverlay />
              <TourCompleteOverlay />
            </>
          )}
          <Hud />
          <GalleryModal />
          <MobileControls />
        </>
      )}
      <ProfilePanel />
    </div>
  );
}
