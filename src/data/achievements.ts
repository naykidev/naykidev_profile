import type { GalleryPiece } from "./projects";
import { asset } from "@/lib/asset";

export type Achievement = {
  id: string;
  title: string;
  issuer: string;
  date: string;
  associated?: string;
  detail: string;
  kind: "award" | "certificate";
  photo?: string;
  photoAlt?: string;
  href?: string;
};

export const achievements: Achievement[] = [
  {
    id: "encinitas-chamber",
    title: "Certificate of Recognition and Rising Star Award",
    issuer: "Encinitas Chamber of Commerce",
    date: "Oct 2025",
    associated: "Torrey Pines High School",
    detail:
      "Recognition from the Encinitas Chamber of Commerce for community impact while at Torrey Pines High School.",
    kind: "award",
  },
  {
    id: "ca-assembly",
    title: "Certificate of Recognition",
    issuer: "California State Assembly",
    date: "Oct 2025",
    associated: "Torrey Pines High School",
    detail: "Official recognition from the California State Assembly, associated with Torrey Pines High School.",
    kind: "certificate",
  },
  {
    id: "ca-senate",
    title: "Certificate of Recognition",
    issuer: "California State Senate",
    date: "Oct 2025",
    associated: "Torrey Pines High School",
    detail: "Official recognition from the California State Senate, associated with Torrey Pines High School.",
    kind: "certificate",
  },
  {
    id: "us-house",
    title: "Congressional Certificate of Special Recognition",
    issuer: "U.S. House of Representatives",
    date: "Oct 2025",
    associated: "Torrey Pines High School",
    detail:
      "Congressional Certificate of Special Recognition from the U.S. House of Representatives, associated with Torrey Pines High School.",
    kind: "certificate",
  },
  {
    id: "encinitas-mayor",
    title: "Mayor's Certificate of Recognition",
    issuer: "City of Encinitas",
    date: "Oct 2025",
    associated: "Torrey Pines High School",
    detail: "Mayor's Certificate of Recognition from the City of Encinitas, associated with Torrey Pines High School.",
    kind: "certificate",
  },
  {
    id: "google-ai",
    title: "Google AI Professional Certificate",
    issuer: "Google · Coursera",
    date: "Jun 24, 2026",
    detail:
      "Completed the Google AI Professional Certificate: seven courses covering AI fundamentals, brainstorming and planning, research and insights, writing and communicating, content creation, data analysis, and app building. Earners are fluent in applying AI across real work and build a portfolio of 20+ artifacts.",
    kind: "certificate",
    photo: asset("/textures/awards/google-ai-certificate.png"),
    photoAlt: "Google AI Professional Certificate awarded to Aaron Nayki on June 24, 2026",
    href: "https://coursera.org/verify/professional-cert/DG2X1OD8KEWQ",
  },
  {
    id: "udl-mindset",
    title: "UDL Mindset Badge",
    issuer: "CAST",
    date: "May 1, 2024",
    detail:
      "Credential 1: UDL Mindset. CAST is a multifaceted organization with a singular ambition: bust the barriers to learning that millions of people experience every day. CAST does this by helping educators and organizations apply insights from the learning sciences and leading-edge practices to educational design and implementation. As part of these ongoing efforts, CAST created the Universal Design for Learning (UDL) Framework and Guidelines. CAST is the nonprofit owner and operator of the Learning Designed online platform, which provides access to competency-based credentials that evaluate knowledge and skill with UDL.",
    kind: "certificate",
    photo: asset("/textures/awards/udl-mindset.png"),
    photoAlt: "CAST Learning Designed Credential 1: UDL Mindset badge, issued May 1, 2024",
  },
];

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function awardPortraitUrl(item: Achievement, index: number) {
  const el = document.createElement("canvas");
  el.width = 1024;
  el.height = 724;
  const ctx = el.getContext("2d");
  if (!ctx) return "";
  const palettes = [
    ["#f7f1e4", "#1d3a5f", "#8b1e2d"],
    ["#f4efe4", "#17345c", "#c4a35a"],
    ["#f6f3ea", "#1a3654", "#2f5d50"],
    ["#f3eee3", "#102a4c", "#9a1f2e"],
    ["#f8f4ea", "#1c3d5a", "#b08d3e"],
    ["#f5f0e6", "#202124", "#4285f4"],
  ];
  const [paper, navy, accent] = palettes[index % palettes.length];
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, 1024, 724);
  ctx.strokeStyle = navy;
  ctx.lineWidth = 18;
  ctx.strokeRect(28, 28, 968, 668);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.strokeRect(44, 44, 936, 636);

  ctx.fillStyle = navy;
  ctx.beginPath();
  ctx.arc(512, 128, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = paper;
  ctx.font = "700 28px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(item.kind === "award" ? "★" : "✦", 512, 128);

  ctx.fillStyle = accent;
  ctx.font = "600 18px Outfit, system-ui, sans-serif";
  ctx.fillText(item.kind === "award" ? "AWARD" : "CERTIFICATE", 512, 192);

  ctx.fillStyle = navy;
  ctx.font = "600 36px Georgia, serif";
  const titleLines = wrapLines(ctx, item.title, 820);
  titleLines.forEach((line, i) => ctx.fillText(line, 512, 250 + i * 42));

  ctx.fillStyle = "#3c3c3c";
  ctx.font = "500 22px Outfit, system-ui, sans-serif";
  ctx.fillText(item.issuer, 512, 250 + titleLines.length * 42 + 36);
  ctx.font = "500 18px Outfit, system-ui, sans-serif";
  ctx.fillText(item.date, 512, 250 + titleLines.length * 42 + 68);
  if (item.associated) {
    ctx.fillStyle = navy;
    ctx.fillText(item.associated, 512, 620);
  }
  return el.toDataURL("image/png");
}

export const awardPieces: GalleryPiece[] = achievements.map((item, index) => ({
  id: item.id,
  name: item.title,
  summary: item.detail,
  context: [item.issuer, item.date, item.associated].filter(Boolean).join(" · "),
  technologies: [item.kind === "certificate" ? "Certificate" : "Award"],
  photo: item.photo,
  photoAlt: item.photoAlt,
  links: item.href ? [{ label: "Verify", href: item.href }] : undefined,
  portrait: item.photo ?? awardPortraitUrl(item, index),
}));
