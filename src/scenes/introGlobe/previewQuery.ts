/** Tiny query helpers with no WebGL imports — safe for classic/mobile entry. */

export function isGlobePreviewQuery() {
  try {
    return new URLSearchParams(window.location.search).get("preview") === "globe";
  } catch {
    return false;
  }
}

export function isSanDiegoPreviewQuery() {
  try {
    return new URLSearchParams(window.location.search).get("preview") === "sandiego";
  } catch {
    return false;
  }
}
