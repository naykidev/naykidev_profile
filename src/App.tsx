import { lazy, Suspense, useEffect } from "react";
import { AccessibilityMenu } from "@/components/ui/AccessibilityMenu";
import { GalleryModal } from "@/components/ui/GalleryModal";
import { Hud } from "@/components/ui/Hud";
import { IntroOverlay } from "@/components/ui/IntroOverlay";
import { TourCompleteOverlay } from "@/components/ui/TourCompleteOverlay";
import { TourExhibitOverlay } from "@/components/ui/TourExhibitOverlay";
import { isGlobePreviewQuery, isSanDiegoPreviewQuery } from "@/scenes/introGlobe/previewQuery";
import { MobileControls } from "@/components/ui/MobileControls";
import { ProfilePanel } from "@/components/ui/ProfilePanel";
import { ClassicSite } from "@/components/classic/ClassicSite";
import { useKeyboard } from "@/hooks/useKeyboard";
import { usePortraitLock } from "@/hooks/usePortraitLock";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useWebGLSupport } from "@/hooks/useWebGL";
import { useTouchUi } from "@/hooks/useCoarsePointer";
import { useAppRoute, useClassicDefaultRedirect, navigate } from "@/hooks/useAppRoute";
import { tryInteract } from "@/systems/interaction";
import { useAppStore } from "@/systems/store";

const CampusScene = lazy(() =>
  import("@/scenes/CampusExperience").then((mod) => ({ default: mod.CampusScene })),
);
const IntroCinematicLayer = lazy(() =>
  import("@/components/ui/IntroJourneyOverlay").then((mod) => ({ default: mod.IntroCinematicLayer })),
);
const IntroGlobePreview = lazy(() =>
  import("@/scenes/introGlobe/IntroGlobeCanvas").then((mod) => ({ default: mod.IntroGlobePreview })),
);
const SanDiegoPreview = lazy(() =>
  import("@/scenes/introGlobe/SanDiegoTilesCanvas").then((mod) => ({ default: mod.SanDiegoPreview })),
);

export function App() {
  const route = useAppRoute();
  const touchUi = useTouchUi();
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
  useClassicDefaultRedirect(touchUi, route);

  useEffect(() => {
    setWebgl(supported);
    if (!supported && route === "campus") {
      navigate("/classic", { replace: true });
    }
  }, [supported, setWebgl, route]);

  useEffect(() => {
    const classic = route === "classic" || touchUi || !webgl;
    document.body.style.overflow = classic ? "auto" : "hidden";
    document.documentElement.style.overflow = classic ? "auto" : "hidden";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [route, touchUi, webgl]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (route !== "campus") return;
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
  }, [
    activePanel,
    closePanel,
    exitGallery,
    galleryProjectId,
    interior,
    mode,
    route,
    setGalleryProject,
    setMode,
    skipIntro,
  ]);

  const globePreview = isGlobePreviewQuery();
  const sandiegoPreview = isSanDiegoPreviewQuery();
  /** Campus 3D only when URL is campus, not touch-compact, and WebGL works. */
  const showCampus = route === "campus" && !touchUi && webgl;

  if (!showCampus) {
    return (
      <div className={`min-h-dvh ${highContrast ? "high-contrast" : ""}`}>
        <ClassicSite />
      </div>
    );
  }

  return (
    <div className={`relative h-full ${highContrast ? "high-contrast" : ""}`}>
      <a
        href="#classic"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-ink focus:px-3 focus:py-2"
        onClick={(event) => {
          event.preventDefault();
          navigate("/classic");
        }}
      >
        Skip 3D experience
      </a>
      <AccessibilityMenu />
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
        <Suspense fallback={null}>
          <SanDiegoPreview />
        </Suspense>
      ) : globePreview ? (
        <Suspense fallback={null}>
          <IntroGlobePreview />
        </Suspense>
      ) : (
        <>
          <Suspense fallback={null}>
            <IntroCinematicLayer />
          </Suspense>
          <IntroOverlay />
          <TourCompleteOverlay />
        </>
      )}
      <Hud />
      <TourExhibitOverlay />
      <GalleryModal />
      <MobileControls />
      <ProfilePanel />
    </div>
  );
}
