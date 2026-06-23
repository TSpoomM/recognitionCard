'use client';

import { CommentType, COMMENT_TYPES, COMMENT_TYPE_META } from "../types/commentType";

type RecognitionCommentTypeSelectProps = {
    selectedTypes: CommentType[];
    onToggleType: (type: CommentType) => void;
};

export default function RecognitionCommentTypeSelect({ selectedTypes, onToggleType }: RecognitionCommentTypeSelectProps) {
    return (
        <div className="grid gap-3 sm:grid-cols-2">
            {COMMENT_TYPES.map((type) => {
                const meta = COMMENT_TYPE_META[type];
                const active = selectedTypes.includes(type);
                return (
                    <button
                        key={type}
                        type="button"
                        onClick={() => onToggleType(type)}
                        className={`relative flex items-start gap-4 rounded-3xl border p-4 text-left transition ${active
                            ? `border-slate-900 bg-white shadow-sm ${meta.ring}`
                            : "border-slate-200 bg-white text-slate-900 hover:border-slate-300"
                            }`}
                    >
                        <div className={`grid h-11 w-11 place-items-center rounded-2xl ${meta.tint}`}>
                            <span className="text-lg">{meta.emoji}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-900">{meta.en}</p>
                            <p className="mt-1 text-xs text-slate-500">{meta.th}</p>
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
