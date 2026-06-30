import { COMMENT_TYPE_META, CommentType } from "@/app/types/commentType";

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
