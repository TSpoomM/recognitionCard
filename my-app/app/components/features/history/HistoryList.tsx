'use client';

import { Component } from "react";
import { Forward, Clock } from "lucide-react";
import { COMMENT_TYPE_META, COMMENT_TYPES, CommentType } from "../../../types/commentType";
import { HistoryItem } from "../../../types/history";
import { LanguageContext } from "../../../context/LanguageContext";

const STAR_SECTION_LABELS = {
  S: "Situation",
  T: "Task",
  A: "Action",
  R: "Result",
} as const;

type HistoryListProps = {
  error: string;
  isLoading: boolean;
  items: HistoryItem[];
  onForward: (item: HistoryItem) => void;
};

function formatDate(value: string | null) {
  if (!value) return "No date";

  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getCoreValueMeta(value: string) {
  const key = value.toUpperCase() as CommentType;
  return COMMENT_TYPE_META[key];
}

function sortCoreValues(values: string[]) {
  return [...values].sort((a, b) => {
    const indexA = COMMENT_TYPES.indexOf(a.toUpperCase() as CommentType);
    const indexB = COMMENT_TYPES.indexOf(b.toUpperCase() as CommentType);

    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
}

function parseStarComment(comment: string): { label: "S" | "T" | "A" | "R"; text: string }[] {
  const sections: { label: "S" | "T" | "A" | "R"; text: string }[] = [
    { label: "S", text: "" },
    { label: "T", text: "" },
    { label: "A", text: "" },
    { label: "R", text: "" },
  ];
  const sectionByLabel = new Map(sections.map((section) => [section.label, section]));
  const matches = Array.from(comment.matchAll(/(^|\s)(S|T|A|R)\s*[:\-]\s*/gi));

  if (matches.length === 0) return [];

  matches.forEach((match, index) => {
    const label = match[2].toUpperCase() as "S" | "T" | "A" | "R";
    const section = sectionByLabel.get(label);

    if (!section || match.index === undefined) return;

    const textStart = match.index + match[0].length;
    const nextMatchIndex = matches[index + 1]?.index ?? comment.length;
    section.text = comment.slice(textStart, nextMatchIndex).trim();
  });

  return sections.filter((section) => section.text);
}

export default class HistoryList extends Component<HistoryListProps> {
  static contextType = LanguageContext;
  declare context: React.ContextType<typeof LanguageContext>;
  render() {
    const { error, isLoading, items, onForward } = this.props;

    if (isLoading) {
      return <p className="text-base text-slate-600">Loading recognition history...</p>;
    }

    if (error) {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-base font-medium text-red-700">
          {error}
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="app-muted-panel rounded-2xl border-dashed p-10 text-center text-base text-slate-500">
          {this.context.lang === "th" ? "ยังไม่มีการส่ง Recognition" : "No sent recognitions yet."}
        </div>
      );
    }

    return (
      <div className="space-y-5">
        {items.map((item) => {
          const fullName = `${item.recipient.firstName} ${item.recipient.lastName}`.trim();
          const initial = fullName.slice(0, 1).toUpperCase();
          const starSections = parseStarComment(item.comment);
          const hasStars = starSections.length > 0;

          return (
            <article
              key={item.id}
              className="rounded-2xl border-[1.5px] border-amber-300 bg-amber-50/50 p-5"
            >
              {/* Header: Avatar + Name + Date */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-800 text-base font-bold text-white">
                    {initial}
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold text-slate-950 truncate">
                      {fullName}
                    </h2>
                    <p className="text-sm text-slate-500 truncate">
                      {(this.context.lang === "th" ? item.recipient.branchDesc : item.recipient.branchNameEn) ||
                        item.recipient.branchDesc ||
                        item.recipient.branchNameEn ||
                        item.recipient.branch ||
                        "-"}
                    </p>
                  </div>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-bold text-amber-800">
                  <Clock className="h-4 w-4" />
                  {formatDate(item.createdDate)}
                </span>
              </div>

              {/* Core Values */}
              {item.coreValues.length > 0 ? (
                <div className="mt-4 rounded-xl border border-slate-200 bg-white/70 p-3">
                  <div className="mb-2 text-base font-bold text-slate-800">
                    {this.context.lang === "th" ? "ค่านิยม" : "Core Values"}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sortCoreValues(item.coreValues).map((value) => {
                      const meta = getCoreValueMeta(value);
                      if (!meta) return null;
                      return (
                        <span
                          key={`${item.id}-${value}`}
                          className={`inline-flex items-center gap-2 rounded-full border border-current/15 px-3 py-1.5 text-base font-bold ${meta.tint}`}
                        >
                          <span className="text-lg leading-none" aria-hidden="true">{meta.emoji}</span>
                          {this.context.lang === "th" ? meta.th : meta.en}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* Comment / STAR sections */}
              {hasStars ? (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {starSections.map((section) => (
                    <section
                      key={section.label}
                      className="overflow-hidden rounded-xl border border-slate-200 bg-white/80"
                    >
                      <div className="flex items-center gap-2 border-b border-slate-200 bg-teal-50 px-4 py-2.5">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-teal-800 text-sm font-bold text-white">
                          {section.label}
                        </span>
                        <h3 className="text-base font-bold text-teal-950">
                          {STAR_SECTION_LABELS[section.label]}
                        </h3>
                      </div>
                      <p className="whitespace-pre-wrap px-4 py-3 text-lg font-medium leading-relaxed text-slate-900">
                        {section.text}
                      </p>
                    </section>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-slate-200 bg-white/70 p-4">
                  <p className="whitespace-pre-wrap text-lg font-medium leading-relaxed text-slate-900">
                    {item.comment}
                  </p>
                </div>
              )}

              {/* Forward button */}
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t-[1.5px] border-amber-300/70 pt-4">
                <button
                  type="button"
                  onClick={() => onForward(item)}
                  className="ml-auto inline-flex min-h-10 items-center gap-1 rounded-xl bg-teal-800 px-4 py-2 text-base font-semibold text-white transition hover:bg-teal-900"
                >
                  <Forward className="h-4 w-4" /> {this.context.lang === "th" ? "ส่งต่อ" : "Forward"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    );
  }
}
