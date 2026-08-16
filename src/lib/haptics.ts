export function haptic(duration = 12) {
  try {
    navigator.vibrate?.(duration);
  } catch {
    /* Safari and some desktops throw or no-op */
  }
}
