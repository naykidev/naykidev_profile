let dragged = false;
let downX = 0;
let downY = 0;

export function notePointerDown(x: number, y: number) {
  dragged = false;
  downX = x;
  downY = y;
}

export function notePointerMove(x: number, y: number) {
  if (Math.hypot(x - downX, y - downY) > 5) dragged = true;
}

export function wasLookDrag(): boolean {
  return dragged;
}
