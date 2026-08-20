import { asset } from "@/lib/asset";

export type ProjectLink = {
  label: string;
  href: string;
};

export type Project = {
  id: string;
  name: string;
  summary: string;
  technologies: string[];
  context?: string;
  links?: ProjectLink[];
  photo?: string;
  photoAlt?: string;
  photos?: readonly { src: string; alt: string }[];
  github?: string;
  demo?: string;
  featured?: boolean;
};

export const axolAssist = {
  id: "axol-assist",
  name: "Axol Assist",
  quote: "Technology should adapt to people — not the other way around.",
  story:
    "Peer tutoring a student with learning disabilities made it obvious that the barriers weren’t intelligence or effort. Sometimes drawings worked better than words. Sometimes technology helped more than traditional instruction. That year became AP Research: interviews with parents, a district assistive-technology specialist, and accessibility professionals at major tech companies, asking why tools built to help students still get in their way. The through-line was that accessibility cannot be bolted on at the end, and that good work starts with listening. Those conversations became Axol Assist — products that make the web easier to use for everyone.",
  products: [
    {
      id: "accessibility-surfer",
      name: "Accessibility Surfer",
      summary:
        "A free Chrome extension for browsing the web in ways that actually work. Whether someone has trouble clicking, gets lost in visual clutter, uses alternative input devices, or just wants a calmer reading experience, Surfer adapts the page to the person — instead of asking the person to adapt to the page. It grew out of research, conversations with accessibility professionals, and user feedback, with the same goal: remove barriers from the environment that already exists.",
      highlights: [
        "Dwell clicking",
        "Reading mode",
        "Focus mode",
        "Font controls",
        "Spacing controls",
        "Contrast controls",
      ],
      photo: asset("/textures/projects/accessibility-surfer-store.png"),
      photoAlt: "Accessibility Surfer on the Chrome Web Store, with dwell and reading controls over a web article",
      links: [
        { label: "Chrome Web Store", href: "https://chromewebstore.google.com/detail/accessibility-surfer/pccmbliammnfaklpblehkonmhcdnedhn" },
        { label: "axolassist.com", href: "https://axolassist.com" },
      ],
    },
    {
      id: "accessflow",
      name: "AccessFlow",
      summary: "An embedded website accessibility toolbar that sites can add as a package.",
      highlights: [
        "Website accessibility toolbar",
        "Embedded accessibility controls",
        "NPM package",
      ],
      links: [{ label: "axolassist.com", href: "https://axolassist.com" }],
    },
    {
      id: "axol-work",
      name: "Axol Work",
      summary:
        "After seeing a friend with disabilities struggle to find jobs that matched their accommodation needs, I built a more accessible employment platform inspired by LinkedIn and Indeed. Axol Work combines professional networking with job searching while letting people share accommodation needs upfront, so employers can make more inclusive hiring decisions. Prospects see shifts ranked by fit — like “3 of 3 needs met” — and recruiters post roles with those accommodations tagged.",
      highlights: [
        "Fit-ranked shifts",
        "Accommodation tags",
        "Prospect and recruiter views",
        "Networking and messaging",
        "Inclusive hiring",
      ],
      photos: [
        {
          src: asset("/textures/projects/axol-work-prospect.png"),
          alt: "Axol Work prospect view: find work sorted by how well each shift fits your needs",
        },
        {
          src: asset("/textures/projects/axol-work-recruiter.png"),
          alt: "Axol Work recruiter dashboard with open shifts, applicants, and quick actions",
        },
        {
          src: asset("/textures/projects/axol-work-shifts.png"),
          alt: "Axol Work recruiter shift listings with accommodation tags",
        },
      ],
      links: [
        { label: "Live demo", href: "https://axolassist.com/demo" },
        { label: "axolassist.com", href: "https://axolassist.com" },
      ],
    },
  ],
} as const;

export type GalleryPiece = {
  id: string;
  name: string;
  summary: string;
  technologies: string[];
  context?: string;
  links?: ProjectLink[];
  photo?: string;
  photoAlt?: string;
  photos?: readonly { src: string; alt: string }[];
  github?: string;
  demo?: string;
  portrait: string;
};

export const arcadeProjects: Project[] = [
  {
    id: "freddy-takes-flight",
    name: "Freddy Takes Flight",
    context: "App Coders/Designers Club · Sep 2023 – May 2024",
    summary:
      "A 2D multi-level action video game inspired by the Torrey Pines High School mascot, Freddy the Falcon. Players guide Freddy through five uniquely designed worlds, each presenting escalating challenges, formidable enemies, and epic boss battles.",
    technologies: ["Game design", "2D"],
    links: [
      { label: "Play on itch.io", href: "https://appcoderzdesignersclub.itch.io/freddy-takes-flight" },
      { label: "Gameplay video", href: "https://www.youtube.com/watch?v=KO6E3_m0J1I" },
    ],
  },
  {
    id: "falconsphere",
    name: "FalconSphere",
    summary: "A campus-oriented digital experience built to connect people and information in one place.",
    technologies: ["Web", "Product design"],
  },
  {
    id: "tutorsync",
    name: "TutorSync",
    summary: "A tutoring coordination tool shaped by real classroom and peer-support experience.",
    technologies: ["JavaScript", "Product thinking"],
  },
  {
    id: "surf-del-mar",
    name: "Surf Del Mar Festival",
    context: "Del Mar Historical Society · with Jervis Fernandes, Cole Chapman, and Keshav Bhaskar",
    summary:
      "The official Surf Del Mar Festival website, built to highlight the history, culture, and community that make Del Mar special. Surf Del Mar is a four-day celebration of the city’s surfing culture and coastal heritage. The site showcases the event, shares stories from the past, and recognizes the sponsors who helped bring it together — October 8–11, 2026.",
    technologies: ["Web", "Design"],
    photo: asset("/textures/projects/surf-del-mar.png"),
    photoAlt: "Surf Del Mar Festival homepage with retro coastal illustration and surfboard navigation",
    links: [{ label: "Festival website", href: "https://surfdelmarfestival.com" }],
  },
  {
    id: "dodo",
    name: "DODO",
    context: "TritonHacks 2024 · May 2024",
    summary:
      "An AI-powered app that helps raise awareness about endangered species and supports conservation research. Using computer vision, it identifies wildlife in user-submitted photos, confirming if a species is endangered. Verified sightings are logged with GPS, date, and environmental data in a central database, allowing researchers to track populations and migration, while involving the public in global biodiversity efforts.",
    technologies: ["Computer vision", "AI", "GPS"],
    links: [
      { label: "Demo video", href: "https://devpost.com/software/dodo-x-extinct" },
      { label: "GitHub", href: "https://github.com/esha0281/DODO_Extinct_APK_Connection" },
    ],
  },
  {
    id: "weather-report",
    name: "Weather Report",
    context: "TritonHacks 2025 · 2nd Place · May 2025",
    summary:
      "A weather app–disguised safety tool that helps users discreetly seek help in dangerous situations. Developed in Android Studio, it allows silent photo and video capture, GPS location sharing, and one-tap emergency calls—all while appearing to function as a simple weather app. We integrated real-time weather data through an API and designed custom pixel art with help from Microsoft Copilot AI to complete the disguise.",
    technologies: ["Android Studio", "APIs", "GPS"],
    photo: asset("/textures/projects/weather-report-tritonhacks.png"),
    photoAlt: "Weather Report team celebrating 2nd place at TritonHacks 2025",
    links: [
      { label: "GitHub", href: "https://github.com/naykidev/Weather-ReportZ" },
      { label: "Demo video", href: "https://devpost.com/software/weather-report-5ifrza" },
    ],
  },
];

function arcade(id: string) {
  const project = arcadeProjects.find((item) => item.id === id);
  if (!project) throw new Error(`Missing arcade project: ${id}`);
  return project;
}

export const galleryPieces: GalleryPiece[] = [
  {
    id: "accessibility-surfer",
    name: "Accessibility Surfer",
    summary: axolAssist.products[0].summary,
    technologies: [...axolAssist.products[0].highlights.slice(0, 4)],
    photo: axolAssist.products[0].photo,
    photoAlt: axolAssist.products[0].photoAlt,
    links: [...axolAssist.products[0].links],
    portrait: asset("/textures/projects/accessibility-surfer.png"),
  },
  {
    id: "axol-assist",
    name: "Axol Assist",
    summary: axolAssist.story,
    technologies: ["Accessibility", "Product design", "Chrome extension", "Web"],
    links: [{ label: "axolassist.com", href: "https://axolassist.com" }],
    portrait: asset("/textures/projects/axol-assist.png"),
  },
  {
    id: "axol-work",
    name: "Axol Work",
    summary: axolAssist.products[2].summary,
    technologies: [...axolAssist.products[2].highlights.slice(0, 4)],
    photos: axolAssist.products[2].photos,
    links: [...axolAssist.products[2].links],
    portrait: asset("/textures/projects/axol-work.png"),
  },
  {
    id: "weather-report",
    name: "Weather Report",
    summary: arcade("weather-report").summary,
    context: arcade("weather-report").context,
    technologies: [...arcade("weather-report").technologies],
    links: arcade("weather-report").links,
    photo: arcade("weather-report").photo,
    photoAlt: arcade("weather-report").photoAlt,
    portrait: asset("/textures/projects/weather-report.png"),
  },
  {
    id: "dodo",
    name: "DODO",
    summary: arcade("dodo").summary,
    context: arcade("dodo").context,
    technologies: [...arcade("dodo").technologies],
    links: arcade("dodo").links,
    portrait: asset("/textures/projects/dodo.png"),
  },
  {
    id: "surf-del-mar",
    name: "Surf Del Mar Festival",
    summary: arcade("surf-del-mar").summary,
    context: arcade("surf-del-mar").context,
    technologies: [...arcade("surf-del-mar").technologies],
    links: arcade("surf-del-mar").links,
    portrait: asset("/textures/projects/surf-del-mar.png"),
  },
  {
    id: "freddy-takes-flight",
    name: "Freddy Takes Flight",
    summary: arcade("freddy-takes-flight").summary,
    context: arcade("freddy-takes-flight").context,
    technologies: [...arcade("freddy-takes-flight").technologies],
    links: arcade("freddy-takes-flight").links,
    portrait: asset("/textures/projects/freddy-takes-flight.png"),
  },
];
