'use client';

import { Component } from "react";
import { Clock } from "lucide-react";
import { COMMENT_TYPE_META, CommentType } from "../../../types/commentType";
import { HistoryItem } from "../../../types/history";

type HistoryListProps = {
  error: string;
  isLoading: boolean;
  items: HistoryItem[];
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

export default class HistoryList extends Component<HistoryListProps> {
  render() {
    const { error, isLoading, items } = this.props;

    if (isLoading) {
      return <p className="text-sm text-slate-600">Loading recognition history...</p>;
    }

    if (error) {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
          {error}
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-base text-slate-500">
          No sent recognitions yet.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-slate-950">
                  {item.recipient.firstName} {item.recipient.lastName}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {item.recipient.role || item.recipient.email || `Employee #${item.recipient.user_id}`}
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                <Clock className="h-4 w-4" />
                {formatDate(item.createdDate)}
              </span>
            </div>

            {item.coreValues.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {item.coreValues.map((value) => {
                  const meta = getCoreValueMeta(value);
                  return (
                    <span
                      key={value}
                      className={`rounded-full px-2.5 py-1 text-[13px] font-bold ${meta?.tint || "bg-slate-100 text-slate-700"}`}
                    >
                      {meta ? `${meta.emoji} ${meta.en}` : value}
                    </span>
                  );
                })}
              </div>
            ) : null}

            <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed font-medium text-slate-900">
              {item.comment}
            </p>
          </article>
        ))}
      </div>
    );
  }
}
