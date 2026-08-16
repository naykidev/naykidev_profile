export const research = {
  title: "E-Learning for K–12 Students With Learning Disabilities",
  question:
    "How can digital learning environments be designed so students with learning disabilities can actually use them — not just access them?",
  methods: [
    "Interviews with parents of students with learning disabilities",
    "District assistive-technology specialist",
    "Accessibility professionals at major technology companies",
    "Universal Design for Learning",
  ],
  findings: [
    "The barriers weren’t intelligence or effort — they were how information and tools were presented.",
    "Accessibility cannot be treated as a feature added at the end of development.",
    "Tools can be technically accessible and still hard to use: text-heavy interfaces, confusing navigation, little real-world testing.",
    "Good accessibility starts with listening to the community you are building for.",
  ],
  principles: [
    "Design for difference from the first sketch.",
    "Give users control instead of assuming a default body or mind.",
    "Ship real tools, then keep listening.",
  ],
  arc: "Research → Understanding accessibility → Building Axol Assist",
} as const;
