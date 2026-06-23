'use client';

import { CommentType, COMMENT_TYPE_META } from "../types/commentType";
import { User } from "../types/user";

type RecognitionReviewSummaryProps = {
    users: User[];
    types: CommentType[];
    comment: string;
};

export default function RecognitionReviewSummary({ users, types, comment }: RecognitionReviewSummaryProps) {
    return (
        <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-700">To</p>
                <div className="mt-3 flex flex-wrap gap-2">
                    {users.map((user) => (
                        <span key={user.user_id} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                            {user.firstName} {user.lastName}
                        </span>
                    ))}
                </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-700">For</p>
                <div className="mt-3 flex flex-wrap gap-2">
                    {types.map((type) => {
                        const meta = COMMENT_TYPE_META[type];
                        return (
                            <span key={type} className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.tint}`}>
                                {meta.emoji} {meta.en}
                            </span>
                        );
                    })}
                </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-700">Comment</p>
                <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{comment}</p>
            </div>
        </div>
    );
}
