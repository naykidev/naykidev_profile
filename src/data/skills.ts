export type SkillGroup = {
  id: string;
  title: string;
  object: string;
  items: string[];
};

export const skills: SkillGroup[] = [
  {
    id: "software",
    title: "Software",
    object: "Computer",
    items: ["Python", "C++", "JavaScript / TypeScript", "Swift", "HTML/CSS"],
  },
  {
    id: "engineering",
    title: "Engineering",
    object: "Circuit board",
    items: ["Computer Engineering", "Robotics", "Embedded Systems"],
  },
  {
    id: "ai",
    title: "AI + Research",
    object: "AI workstation",
    items: ["Machine Learning", "Computer Vision", "AI applications"],
  },
];
