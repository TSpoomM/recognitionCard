import type { StarSections } from "../types/starSections";

export type StarSectionKey = "s" | "t" | "a" | "r";

export const STAR_SECTION_LABELS: Record<StarSectionKey, string> = {
  s: "Situation",
  t: "Task",
  a: "Action",
  r: "Result",
};

export const EMPTY_STAR_SECTIONS: StarSections = { s: "", t: "", a: "", r: "" };

export function serializeStarSections(sections?: StarSections, fallback = "") {
  if (!sections || Object.values(sections).every((value) => !value.trim())) return fallback;
  return (["s", "t", "a", "r"] as (keyof StarSections)[])
    .map((key) => `${key.toUpperCase()}: ${sections[key].trim()}`)
    .join("\n\n");
}

export function parseStarCommentToSections(comment: string): StarSections {
  const sections: StarSections = { s: "", t: "", a: "", r: "" };
  const matches = Array.from(comment.matchAll(/(^|\n)\s*(S|T|A|R)\s*[:\-]\s*/gi));
  if (matches.length === 0) return sections;
  matches.forEach((match, index) => {
    const label = match[2].toLowerCase() as keyof StarSections;
    if (!(label in sections)) return;
    const textStart = (match.index ?? 0) + match[0].length;
    const nextMatchIndex = matches[index + 1]?.index ?? comment.length;
    const text = comment.slice(textStart, nextMatchIndex).trim();
    sections[label] = text;
  });
  return sections;
}
