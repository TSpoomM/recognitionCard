export type CommentType =
  | "RESPECT"
  | "LEADERSHIP"
  | "COMMUNICATION"
  | "PROFESSIONALISM"
  | "INTEGRITY";

export const COMMENT_TYPES: CommentType[] = [
  "RESPECT",
  "LEADERSHIP",
  "COMMUNICATION",
  "PROFESSIONALISM",
  "INTEGRITY",
];

export const COMMENT_TYPE_META: Record<
  CommentType,
  {
    emoji: string;
    en: string;
    th: string;
    tint: string;
    ring: string;
  }
> = {
  "RESPECT": {
    emoji: "🤝",
    en: "Respect",
    th: "ความเคารพ",
    tint: "bg-emerald-100 text-emerald-700",
    ring: "ring-emerald-200",
  },
  "LEADERSHIP": {
    emoji: "🌟",
    en: "Leadership",
    th: "ความเป็นผู้นำ",
    tint: "bg-sky-100 text-sky-700",
    ring: "ring-sky-200",
  },
  "COMMUNICATION": {
    emoji: "💬",
    en: "Communication",
    th: "การสื่อสาร",
    tint: "bg-violet-100 text-violet-700",
    ring: "ring-violet-200",
  },
  "PROFESSIONALISM": {
    emoji: "💼",
    en: "Professionalism",
    th: "ความมืออาชีพ",
    tint: "bg-amber-100 text-amber-700",
    ring: "ring-amber-200",
  },
  "INTEGRITY": {
    emoji: "🛡️",
    en: "Integrity",
    th: "ความซื่อสัตย์",
    tint: "bg-rose-100 text-rose-700",
    ring: "ring-rose-200",
  },
};