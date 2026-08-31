import { asset } from "@/lib/asset";

export const profile = {
  name: "Aaron Nayki",
  headline: "Computer Engineering @ UW–Madison",
  tagline: "Explore my journey.",
  locationPath: "San Diego → Madison",
  email: "college.naykiaaron@gmail.com",
  linkedin: "https://www.linkedin.com/in/aaron-nayki",
  photo: asset("/textures/profile/aaron-nayki.png"),
  resume: asset("/resume/Resume2026.pdf"),
  intro: [
    "Hi, my name is Aaron Nayki, and I’m a freshman at the University of Wisconsin–Madison studying Computer Engineering.",
    "I was born and raised in San Diego, California, and I’m interested in developing digital accessibility platforms, assistive devices, and technologies that make everyday technology more usable and accessible.",
    "I’m also interested in artificial intelligence, robotics, embedded systems, and the intersection of hardware and software, especially how these technologies can be applied to solve real-world problems and improve people’s lives.",
    "In my free time, I enjoy working on side projects as a way to volunteer my technical skills, solve problems for others, and create things that can have a meaningful impact.",
    "Outside of engineering, I enjoy playing guitar and following Formula 1.",
  ],
} as const;
