import { CanvasTexture, ClampToEdgeWrapping, RepeatWrapping, SRGBColorSpace } from "three";

function canvas(size = 512, height = size) {
  const el = document.createElement("canvas");
  el.width = size;
  el.height = height;
  const ctx = el.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");
  return { el, ctx };
}

function noise(ctx: CanvasRenderingContext2D, amount: number) {
  const { width, height } = ctx.canvas;
  const data = ctx.getImageData(0, 0, width, height);
  for (let i = 0; i < data.data.length; i += 4) {
    const n = (Math.random() - 0.5) * amount;
    data.data[i] += n;
    data.data[i + 1] += n;
    data.data[i + 2] += n;
  }
  ctx.putImageData(data, 0, 0);
}

function toTexture(
  el: HTMLCanvasElement,
  repeatX = 1,
  repeatY = 1,
  clamp = false,
): CanvasTexture {
  const texture = new CanvasTexture(el);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = clamp ? ClampToEdgeWrapping : RepeatWrapping;
  texture.wrapT = clamp ? ClampToEdgeWrapping : RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

export function makeSandstoneTexture() {
  const { el, ctx } = canvas(512);
  ctx.fillStyle = "#cbb089";
  ctx.fillRect(0, 0, 512, 512);
  const rowH = 42;
  for (let y = 0; y < 512; y += rowH) {
    const offset = ((y / rowH) % 2) * 36;
    for (let x = -40; x < 512; x += 72) {
      const r = 205 + Math.random() * 22;
      const g = 176 + Math.random() * 18;
      const b = 128 + Math.random() * 16;
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x + offset + 2, y + 2, 68, rowH - 4);
      ctx.strokeStyle = "rgba(120, 96, 64, 0.22)";
      ctx.strokeRect(x + offset + 2, y + 2, 68, rowH - 4);
    }
  }
  noise(ctx, 16);
  return toTexture(el, 6, 3);
}

export function makeSlateTexture() {
  const { el, ctx } = canvas(256);
  ctx.fillStyle = "#3a3f46";
  ctx.fillRect(0, 0, 256, 256);
  for (let x = 0; x < 256; x += 18) {
    ctx.fillStyle = x % 36 === 0 ? "#2e3339" : "#444b53";
    ctx.fillRect(x, 0, 2, 256);
  }
  for (let y = 0; y < 256; y += 28) {
    ctx.fillStyle = "rgba(20,22,26,0.35)";
    ctx.fillRect(0, y, 256, 1);
  }
  noise(ctx, 12);
  return toTexture(el, 8, 4);
}

export function makeCreamTexture() {
  const { el, ctx } = canvas(256);
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, "#f7f1e4");
  g.addColorStop(1, "#e8dcc6");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  noise(ctx, 10);
  return toTexture(el, 2, 2);
}

export function makeWBannerTexture() {
  const { el, ctx } = canvas(256);
  ctx.fillStyle = "#c5050c";
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = "#f4eee3";
  ctx.font = "700 168px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("W", 128, 132);
  return toTexture(el, 1, 1);
}

export function makeFlagTexture() {
  const { el, ctx } = canvas(256);
  for (let i = 0; i < 13; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? "#b22234" : "#f4eee3";
    ctx.fillRect(0, (256 / 13) * i, 256, 256 / 13);
  }
  ctx.fillStyle = "#1a365d";
  ctx.fillRect(0, 0, 110, 110);
  ctx.fillStyle = "#f4eee3";
  for (let r = 0; r < 5; r += 1) {
    for (let c = 0; c < 6; c += 1) {
      ctx.beginPath();
      ctx.arc(12 + c * 18, 12 + r * 20, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  return toTexture(el, 1, 1);
}

export function makeEntablatureTexture() {
  const { el, ctx } = canvas(1024);
  ctx.fillStyle = "#e7d9be";
  ctx.fillRect(0, 0, 1024, 512);
  ctx.fillStyle = "#5a4630";
  ctx.font = "600 96px 'Times New Roman', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.letterSpacing = "18px";
  ctx.fillText("BASCOM HALL", 512, 256);
  return toTexture(el, 1, 1, true);
}

export function makeHallSignTexture(label: string, fontSize = 72) {
  const { el, ctx } = canvas(1024, 256);
  ctx.fillStyle = "#1c1814";
  ctx.fillRect(0, 0, 1024, 256);
  ctx.strokeStyle = "#e8d3a8";
  ctx.lineWidth = 10;
  ctx.strokeRect(18, 18, 988, 220);
  ctx.fillStyle = "#f4ece0";
  ctx.font = `600 ${fontSize}px 'Times New Roman', serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const lines = label.split("\n");
  const step = fontSize + 8;
  const start = 128 - ((lines.length - 1) * step) / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line, 512, start + i * step);
  });
  return toTexture(el, 1, 1, true);
}

function paintCartoonPlank(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const bands = 18;
  for (let i = 0; i < bands; i += 1) {
    const t = i / bands;
    const r = 186 - t * 28 + (i % 3) * 6;
    const g = 124 - t * 22 + (i % 2) * 8;
    const b = 72 - t * 14;
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, (height / bands) * i, width, height / bands + 1);
  }
  for (let y = 10; y < height; y += 14) {
    ctx.strokeStyle = `rgba(92, 48, 22, ${0.18 + (y % 28 === 0 ? 0.16 : 0)})`;
    ctx.lineWidth = y % 42 === 0 ? 3 : 1.4;
    ctx.beginPath();
    ctx.moveTo(0, y + Math.sin(y * 0.2) * 1.5);
    ctx.lineTo(width, y + Math.cos(y * 0.15) * 1.5);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(255, 220, 170, 0.22)";
  ctx.fillRect(0, 0, width, 16);
  ctx.fillStyle = "rgba(60, 28, 12, 0.28)";
  ctx.fillRect(0, height - 16, width, 16);
  ctx.strokeStyle = "rgba(72, 38, 16, 0.45)";
  ctx.lineWidth = 14;
  ctx.strokeRect(7, 7, width - 14, height - 14);
}

export function makeGalleryWayfindTexture(label: string, fontSize = 210) {
  const width = 2048;
  const height = 512;
  const { el, ctx } = canvas(width, height);
  paintCartoonPlank(ctx, width, height);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.letterSpacing = fontSize > 170 ? "0.08em" : "0.04em";
  ctx.font = `700 ${fontSize}px 'Cormorant Garamond', Georgia, serif`;
  ctx.fillStyle = "rgba(48, 24, 10, 0.35)";
  ctx.fillText(label, width / 2 + 4, height / 2 + 6);
  ctx.fillStyle = "#3a1f10";
  ctx.fillText(label, width / 2, height / 2);
  ctx.strokeStyle = "rgba(92, 48, 22, 0.35)";
  ctx.lineWidth = 3;
  ctx.strokeText(label, width / 2, height / 2);
  const texture = toTexture(el, 1, 1, true);
  texture.anisotropy = 16;
  return texture;
}

export function makeMarbleTexture() {
  const { el, ctx } = canvas(512);
  ctx.fillStyle = "#ebe4d8";
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 18; i += 1) {
    ctx.strokeStyle = `rgba(150, 140, 128, ${0.12 + Math.random() * 0.18})`;
    ctx.lineWidth = 1 + Math.random() * 2;
    ctx.beginPath();
    ctx.moveTo(Math.random() * 512, Math.random() * 512);
    ctx.bezierCurveTo(
      Math.random() * 512,
      Math.random() * 512,
      Math.random() * 512,
      Math.random() * 512,
      Math.random() * 512,
      Math.random() * 512,
    );
    ctx.stroke();
  }
  for (let y = 0; y < 512; y += 64) {
    ctx.fillStyle = "rgba(255,255,255,0.07)";
    ctx.fillRect(0, y, 512, 32);
  }
  noise(ctx, 10);
  return toTexture(el, 4, 4);
}

export function makeHardwoodTexture() {
  const { el, ctx } = canvas(512);
  const plank = 42;
  for (let y = 0; y < 512; y += plank) {
    const base = 38 + Math.random() * 14;
    ctx.fillStyle = `rgb(${base + 28}, ${base + 12}, ${base})`;
    ctx.fillRect(0, y, 512, plank - 1);
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(0, y + plank - 2, 512, 2);
    for (let g = 0; g < 6; g += 1) {
      ctx.strokeStyle = `rgba(255,220,180,${0.03 + Math.random() * 0.04})`;
      ctx.beginPath();
      ctx.moveTo(0, y + 6 + g * 6);
      ctx.lineTo(512, y + 8 + g * 6);
      ctx.stroke();
    }
  }
  noise(ctx, 12);
  return toTexture(el, 4, 6);
}

export function makePlaqueTexture(title: string) {
  const { el, ctx } = canvas(1024, 256);
  ctx.fillStyle = "#8a6a32";
  ctx.fillRect(0, 0, 1024, 256);
  ctx.strokeStyle = "#d8c07a";
  ctx.lineWidth = 10;
  ctx.strokeRect(12, 12, 1000, 232);
  ctx.fillStyle = "#ffffff";
  ctx.font = "600 72px 'Times New Roman', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const words = title.toUpperCase().split(" ");
  let line = words[0] ?? "";
  const lines: string[] = [];
  for (let i = 1; i < words.length; i += 1) {
    const next = `${line} ${words[i]}`;
    if (ctx.measureText(next).width > 920) {
      lines.push(line);
      line = words[i];
    } else {
      line = next;
    }
  }
  lines.push(line);
  const startY = 128 - ((lines.length - 1) * 40) / 2;
  lines.forEach((text, i) => {
    ctx.fillText(text, 512, startY + i * 80);
  });
  return toTexture(el, 1, 1, true);
}

const PROJECT_PALETTES = [
  ["#3d1f24", "#c5050c", "#f4ece0"],
  ["#1c2838", "#7a93b0", "#e8d3a8"],
  ["#243428", "#5f6e4e", "#f3ead8"],
  ["#2a221c", "#c49a68", "#ead9b8"],
  ["#1a2430", "#8aa4b8", "#f6f0e4"],
  ["#351a22", "#a33b44", "#f4ece0"],
  ["#2c2418", "#7a5a32", "#e2c79a"],
  ["#1e2a32", "#4b5158", "#d8c7a6"],
];

export function makeProjectCanvasTexture(title: string, index: number) {
  const { el, ctx } = canvas(768, 512);
  const [deep, accent, paper] = PROJECT_PALETTES[index % PROJECT_PALETTES.length];
  ctx.fillStyle = deep;
  ctx.fillRect(0, 0, 768, 512);
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, 768, 18);
  ctx.fillRect(0, 494, 768, 18);
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = paper;
  ctx.beginPath();
  ctx.arc(620, 90, 160, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(40, 340, 420, 8);
  ctx.globalAlpha = 1;
  ctx.fillStyle = paper;
  ctx.font = "600 42px Georgia, serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  const words = title.toUpperCase().split(" ");
  let line = "";
  let y = 210;
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > 640) {
      ctx.fillText(line, 48, y);
      line = word;
      y += 52;
    } else {
      line = next;
    }
  }
  ctx.fillText(line, 48, y);
  ctx.font = "500 18px Outfit, system-ui, sans-serif";
  ctx.fillStyle = accent;
  ctx.fillText("SELECTED WORK", 48, 150);
  return toTexture(el, 1, 1, true);
}

export const sandstoneMap = makeSandstoneTexture();
export const slateMap = makeSlateTexture();
export const creamMap = makeCreamTexture();
export const wBannerMap = makeWBannerTexture();
export const flagMap = makeFlagTexture();
export const entablatureMap = makeEntablatureTexture();
export const gallerySignMap = makeHallSignTexture("PROJECTS GALLERY");
export const awardsSignMap = makeHallSignTexture("AWARDS &\nCERTIFICATES", 54);
export const galleryWayfindProjectsMap = makeGalleryWayfindTexture("PROJECTS");
export const galleryWayfindAwardsMap = makeGalleryWayfindTexture("AWARDS");
export const galleryWayfindAmpersandMap = makeGalleryWayfindTexture("&", 280);
export const galleryWayfindCertificatesMap = makeGalleryWayfindTexture("CERTIFICATES", 148);
export const galleryWayfindGalleryMap = makeGalleryWayfindTexture("GALLERY");
export const marbleMap = makeMarbleTexture();
export const hardwoodMap = makeHardwoodTexture();
