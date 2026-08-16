export type ExperienceEntry = {
  id: string;
  title: string;
  org: string;
  summary: string;
};

export const experience: ExperienceEntry[] = [
  {
    id: "peer-tutoring",
    title: "Peer tutoring",
    org: "Torrey Pines High School",
    summary: "Supported classmates one-on-one, translating difficult material into clearer steps.",
  },
  {
    id: "ta",
    title: "Teaching assistant",
    org: "Classroom support",
    summary: "Helped students stay on track during instruction and built patience into how I explain technical ideas.",
  },
  {
    id: "udl",
    title: "UDL Level 3 credential",
    org: "Universal Design for Learning",
    summary: "Studied how to design learning experiences that work for a wider range of students from the start.",
  },
  {
    id: "rising-star",
    title: "Rising Star recognition",
    org: "Tutoring community",
    summary: "Recognized for consistent, student-centered support.",
  },
  {
    id: "app-coders",
    title: "App Coders / Designers Club",
    org: "Student organization",
    summary: "Built and designed apps with peers, practicing both engineering craft and collaboration.",
  },
];
