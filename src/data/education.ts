export type EducationEntry = {
  id: string;
  institution: string;
  program: string;
  dates: string;
  location: string;
  details: string[];
};

export const education: EducationEntry[] = [
  {
    id: "uw-madison",
    institution: "University of Wisconsin–Madison",
    program: "Computer Engineering",
    dates: "2026–Present",
    location: "Madison, WI",
    details: [
      "Incoming Computer Engineering student focused on software, embedded systems, and human-centered technology.",
      "Building a body of work around accessibility, AI applications, and products that solve real problems.",
    ],
  },
  {
    id: "torrey-pines",
    institution: "Torrey Pines High School",
    program: "College-preparatory coursework",
    dates: "Graduated 2026",
    location: "San Diego, CA",
    details: [
      "Advanced Placement: Computer Science Principles, Computer Science A, Calculus AB, and additional STEM coursework.",
      "AP Research: E-Learning for K–12 Students With Learning Disabilities.",
      "Leadership through tutoring, teaching assistant work, and student clubs.",
    ],
  },
];
