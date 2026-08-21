import { useEffect, useState } from "react";
import { navigate, resolveAppRoute, type AppRoute } from "@/lib/appRoute";

export { navigate, resolveAppRoute, withBase, appPathname } from "@/lib/appRoute";
export type { AppRoute } from "@/lib/appRoute";

export function useAppRoute(): AppRoute {
  const [route, setRoute] = useState<AppRoute>(() =>
    typeof window === "undefined" ? "campus" : resolveAppRoute(),
  );

  useEffect(() => {
    const sync = () => setRoute(resolveAppRoute());
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  return route;
}

/** Mobile/touch compact UI — phones land on classic by default. */
export function useClassicDefaultRedirect(touchUi: boolean, route: AppRoute) {
  useEffect(() => {
    if (touchUi && route === "campus") {
      navigate("/classic", { replace: true });
    }
  }, [touchUi, route]);
}
