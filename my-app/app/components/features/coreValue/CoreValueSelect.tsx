'use client';

import { Component } from "react";
import { CommentType, COMMENT_TYPES, COMMENT_TYPE_META } from "../../../types/commentType";

type CoreValueSelectProps = {
  selectedTypes: CommentType[];
  onToggleType: (type: CommentType) => void;
};

export default class CoreValueSelect extends Component<CoreValueSelectProps> {
  render() {
    const { selectedTypes, onToggleType } = this.props;

    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {COMMENT_TYPES.map((type) => {
          const meta = COMMENT_TYPE_META[type];
          const active = selectedTypes.includes(type);
          return (
            <button
              key={type}
              type="button"
              onClick={() => onToggleType(type)}
              className={`relative flex items-start gap-4 rounded-3xl border p-5 text-left transition ${active
                ? `border-slate-900 bg-white shadow-sm ${meta.ring}`
                : "border-slate-200 bg-white text-slate-900 hover:border-slate-300"
                }`}
            >
              <div className={`grid h-12 w-12 place-items-center rounded-2xl ${meta.tint}`}>
                <span className="text-xl">{meta.emoji}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-semibold text-slate-900">{meta.en}</p>
                <p className="mt-1 text-base text-slate-500">{meta.th}</p>
              </div>
              <div className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-300"}`}>
                ✓
              </div>
            </button>
          );
        })}
      </div>
    );
  }
}
