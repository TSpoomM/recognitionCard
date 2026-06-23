'use client';

import { PendingSubmission } from "../types/pendingSubmission";
import { RecognitionEngine } from "../lib/RecognitionEngine";
import { COMMENT_TYPE_META } from "../types/commentType";

type RecognitionPendingPanelProps = {
    submissions: PendingSubmission[];
    onEditPending: (submission: PendingSubmission) => void;
    onDeletePending: (submissionId: string) => void;
};

export default function RecognitionPendingPanel({ submissions, onEditPending, onDeletePending }: RecognitionPendingPanelProps) {
    return (
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">Pending reviews</h2>
                        <p className="text-sm text-slate-600">
                            Edit or delete before the card is automatically sent to the database.
                        </p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                        {submissions.filter((item) => item.status === "pending").length} pending
                    </span>
                </div>

                <div className="space-y-4">
                    {submissions.length === 0 ? (
                        <div className="rounded-3xl bg-slate-50 p-6 text-slate-600">No recognition cards submitted yet.</div>
                    ) : (
                        submissions.map((submission) => (
                            <div key={submission.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
                                    <div>
                                        <p className="text-sm text-slate-500">Types</p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {(submission.types?.length ? submission.types : submission.type ? [submission.type] : []).map((type) => {
                                                const meta = COMMENT_TYPE_META[type];
                                                return (
                                                    <span key={type} className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.tint}`}>
                                                        {meta.emoji} {meta.en}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="rounded-2xl bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
                                        {submission.status === "pending"
                                            ? `Pending ${RecognitionEngine.formatRemaining(submission.createdAt)}`
                                            : "Sent to database"}
                                    </div>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">Users</p>
                                        <ul className="mt-2 space-y-2 text-sm text-slate-600">
                                            {submission.users.map((user) => (
                                                <li key={user.user_id}>
                                                    {user.firstName} {user.lastName} · {user.role ?? user.email}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">Comment</p>
                                        <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{submission.comment}</p>
                                    </div>
                                </div>
                                <div className="mt-5 flex flex-wrap gap-3">
                                    {submission.status === "pending" ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => onEditPending(submission)}
                                                className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:border-slate-400"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onDeletePending(submission.id)}
                                                className="rounded-2xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                                            >
                                                Delete
                                            </button>
                                        </>
                                    ) : null}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-3 text-xl font-semibold text-slate-900">Sent cards</h2>
                <p className="mb-6 text-sm text-slate-600">
                    After 2 minutes your pending card is marked as sent. This simulates the database send step.
                </p>
                <div className="space-y-4">
                    {submissions.filter((item) => item.status === "sent").length === 0 ? (
                        <div className="rounded-3xl bg-slate-50 p-5 text-slate-600">No cards have been sent yet.</div>
                    ) : (
                        submissions
                            .filter((item) => item.status === "sent")
                            .map((submission) => (
                                <div key={submission.id} className="rounded-3xl bg-slate-50 p-4">
                                    <p className="text-sm font-semibold text-slate-900">{submission.types.join(", ")}</p>
                                    <p className="mt-2 text-sm text-slate-700">{submission.comment}</p>
                                </div>
                            ))
                    )}
                </div>
            </div>
        </div>
    );
}
