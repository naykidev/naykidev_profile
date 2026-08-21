import { education, type EducationEntry } from "@/data/education";
import { experience, type ExperienceEntry } from "@/data/experience";

/** Shared timeline row after normalizing education vs experience (different source shapes). */
export type TimelineItem = {
  id: string;
  kind: "Education" | "Experience";
  title: string;
  meta: string;
  body: string;
  /** Higher = shown first (most-recent-first). */
  sortKey: number;
};

function fromEducation(entry: EducationEntry): TimelineItem {
  // UW (present) floats to top; graduated HS sinks below experience band.
  const present = /present/i.test(entry.dates);
  return {
    id: `edu-${entry.id}`,
    kind: "Education",
    title: entry.institution,
    meta: `${entry.program} · ${entry.dates} · ${entry.location}`,
    body: entry.details.join(" "),
    sortKey: present ? 400 : 100,
  };
}

/**
 * Experience entries have no `dates` field in src/data/experience.ts.
 * Place the band between current school (400) and prior school (100).
 */
function fromExperience(entry: ExperienceEntry, index: number, count: number): TimelineItem {
  return {
    id: `exp-${entry.id}`,
    kind: "Experience",
    title: entry.title,
    meta: entry.org,
    body: entry.summary,
    sortKey: 300 - (index + 1) / (count + 1) * 50,
  };
}

export function buildJourneyTimeline(): TimelineItem[] {
  const edu = education.map(fromEducation);
  const exp = experience.map((entry, i) => fromExperience(entry, i, experience.length));
  return [...edu, ...exp].sort((a, b) => b.sortKey - a.sortKey);
}
