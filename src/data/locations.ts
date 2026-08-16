export type PanelKind =
  | "about"
  | "education"
  | "skills"
  | "axol"
  | "research"
  | "projects"
  | "tutoring"
  | "achievements"
  | "interests"
  | "future";

export type WorldLocation = {
  id: string;
  name: string;
  panel: PanelKind;
  prompt: string;
  position: [number, number, number];
  lookAt: [number, number, number];
  radius: number;
  tour?: boolean;
  built: boolean;
  tourCamera?: [number, number, number];
  /** Play the interior camera sequence for this hall during the tour. */
  tourInterior?: "gallery" | "awards";
};

export const locations: WorldLocation[] = [
  {
    id: "bascom-hill",
    name: "About Me",
    panel: "about",
    prompt: "Explore Aaron",
    position: [0, 2.2, 8],
    lookAt: [0, 3.4, -6],
    radius: 4.2,
    tour: true,
    built: true,
    tourCamera: [0, 3.4, 29.5],
  },
  {
    id: "bascom-hall",
    name: "Bascom Hall",
    panel: "education",
    prompt: "Enter Education",
    position: [0, 5.6, -16.2],
    lookAt: [0, 6.8, -22],
    radius: 5.5,
    built: true,
    tourCamera: [0, 3.4, 29.5],
  },
  {
    id: "lincoln",
    name: "Lincoln Monument",
    panel: "about",
    prompt: "Pause here",
    position: [0, 5.1, -13.35],
    lookAt: [0, 6.0, -13.35],
    radius: 3.2,
    built: true,
  },
  {
    id: "axol",
    name: "Axol Assist",
    panel: "axol",
    prompt: "Enter Axol Assist",
    position: [-18, 2.2, 28],
    lookAt: [-18, 3.5, 32],
    radius: 5,
    built: true,
  },
  {
    id: "projects-gallery",
    name: "Projects Gallery",
    panel: "projects",
    prompt: "Open gallery",
    position: [6.1, 2.2, 18.4],
    lookAt: [10.45, 3.5, 18.4],
    radius: 4.1,
    tour: true,
    built: true,
    tourCamera: [7.55, 3.25, 18.4],
    tourInterior: "gallery",
  },
  {
    id: "gallery-exit",
    name: "Gallery Exit",
    panel: "projects",
    prompt: "Leave gallery",
    position: [11.5, 2.4, 18.4],
    lookAt: [7.6, 2.8, 18.4],
    radius: 2.15,
    built: true,
  },
  {
    id: "arcade",
    name: "Project Arcade",
    panel: "projects",
    prompt: "Play a project",
    position: [28, 1.6, 30],
    lookAt: [28, 2.4, 34],
    radius: 4.8,
    built: true,
  },
  {
    id: "awards-gallery",
    name: "Awards & Certificates",
    panel: "achievements",
    prompt: "Open awards",
    position: [-6.1, 2.2, 18.4],
    lookAt: [-10.45, 3.5, 18.4],
    radius: 4.1,
    tour: true,
    built: true,
    tourCamera: [-7.55, 3.25, 18.4],
    tourInterior: "awards",
  },
  {
    id: "awards-exit",
    name: "Gallery Exit",
    panel: "achievements",
    prompt: "Leave gallery",
    position: [-11.5, 2.4, 18.4],
    lookAt: [-7.6, 2.8, 18.4],
    radius: 2.15,
    built: true,
  },
  {
    id: "interests",
    name: "Quiet Corner",
    panel: "interests",
    prompt: "Take a moment",
    position: [8, 1.4, 40],
    lookAt: [8, 2.2, 40],
    radius: 3.5,
    built: true,
  },
  {
    id: "future",
    name: "The Next Chapter",
    panel: "future",
    prompt: "Look ahead",
    position: [0, 0.8, 48],
    lookAt: [0, 2.4, 62],
    radius: 6,
    built: true,
    tourCamera: [0, 2.7, 39],
  },
];

const TOUR_ORDER = ["bascom-hill", "projects-gallery", "awards-gallery"];

export const tourStops = TOUR_ORDER.map(
  (id) => locations.find((location) => location.id === id)!,
);
