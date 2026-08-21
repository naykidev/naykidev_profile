/** Pathname routing for campus vs classic — no React Router. */

export type AppRoute = "campus" | "classic";

function normalizeBase() {
  const raw = import.meta.env.BASE_URL || "/";
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

/** App path without Vite base, always starting with `/`. */
export function appPathname(pathname = window.location.pathname): string {
  const base = normalizeBase();
  let path = pathname;
  if (base && path.startsWith(base)) {
    path = path.slice(base.length) || "/";
  }
  if (!path.startsWith("/")) path = `/${path}`;
  // Strip trailing slash except root
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return path;
}

export function resolveAppRoute(pathname = window.location.pathname): AppRoute {
  const path = appPathname(pathname);
  if (path === "/classic" || path.startsWith("/classic/")) return "classic";
  return "campus";
}

/** Build a browser URL for an app path like `/classic` or `/classic#resume`. */
export function withBase(appPath: string): string {
  const base = normalizeBase();
  const [pathPart, hash = ""] = appPath.split("#");
  let path = pathPart || "/";
  if (!path.startsWith("/")) path = `/${path}`;
  const url = `${base}${path === "/" ? "/" : path}`;
  return hash ? `${url}#${hash}` : url;
}

/**
 * Soft-navigate with history API so the SPA stays mounted.
 * pushState does not fire popstate — we dispatch one so listeners update.
 */
export function navigate(appPath: string, options?: { replace?: boolean }) {
  const url = withBase(appPath);
  const method = options?.replace ? "replaceState" : "pushState";
  window.history[method](null, "", url);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
