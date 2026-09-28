import {
  COMMENT_TYPE_META,
  COMMENT_TYPES,
  CommentType,
} from "@/src/core/types/commentType";

export function splitName(fullName: string) {
  const [firstName = "", ...rest] = fullName.trim().split(/\s+/);
  return {
    firstName: firstName || fullName,
    lastName: rest.join(" "),
  };
}

export function getCoreValueLabel(value: string) {
  const normalized = value.trim().toUpperCase().replace(/\s+/g, "_") as CommentType;
  const meta = COMMENT_TYPE_META[normalized];
  return meta ? `${meta.en}` : value.trim();
}

export function parseCoreValues(raw: string | null | undefined) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function normalizeCoreValueCode(value: string) {
  const raw = value.trim().toUpperCase();
  const beforeParen = raw.replace(/\(.*\)$/, "").trim();
  const candidate = beforeParen
    .replace(/\s+/g, "_")
    .replace(/[^A-Z0-9_]/g, "_")
    .replace(/^_+|_+$/g, "");

  if (COMMENT_TYPES.includes(candidate as CommentType)) return candidate;
  return COMMENT_TYPES.find((type) => beforeParen.includes(type)) || candidate;
}

export function getCoreValueDisplayLabel(value: string) {
  const meta = COMMENT_TYPE_META[normalizeCoreValueCode(value) as CommentType];
  return meta ? meta.en : value.trim();
}

export function sortCoreValues(values: string[]) {
  return [...values].sort((a, b) => {
    const indexA = COMMENT_TYPES.indexOf(a.toUpperCase() as CommentType);
    const indexB = COMMENT_TYPES.indexOf(b.toUpperCase() as CommentType);

    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
}

export function toggleArrayItem<T>(items: T[], item: T) {
  return items.includes(item)
    ? items.filter((currentItem) => currentItem !== item)
    : [...items, item];
}
