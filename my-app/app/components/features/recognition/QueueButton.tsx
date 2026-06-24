'use client';

import { useMemo, useState } from "react";
import { PendingSubmission } from "../../../types/pendingSubmission";
import { COMMENT_TYPE_META } from "../../../types/commentType";
import { RecognitionEngine } from "../../../lib/RecognitionEngine";
import Card from "../../ui/Card";

type RecognitionQueueButtonProps = {
  submissions: PendingSubmission[];
  onEditPending: (submission: PendingSubmission) => void;
  onDeletePending: (submissionId: string) => void;
  onConfirmPending: (submissionId: string) => void;
};

function QueueIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 6h13M8 12h13M8 18h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="m3 6 .7.7L5.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m3 12 .7.7 1.8-1.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m3 18 .7.7 1.8-1.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PencilIcon({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20h4l11-11a2.8 2.8 0 0 0-4-4L4 16v4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="m13 7 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SendIcon({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m4 4 17 8-17 8 3-8-3-8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function getSubmissionTypes(submission: PendingSubmission) {
  return submission.types?.length ? submission.types : submission.type ? [submission.type] : [];
}

export default function RecognitionQueueButton({
  submissions,
  onEditPending,
  onDeletePending,
  onConfirmPending,
}: RecognitionQueueButtonProps) {
  const [open, setOpen] = useState(false);
  const pendingCount = useMemo(() => submissions.filter((item) => item.status === "pending").length, [submissions]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 inline-flex min-h-12 items-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-slate-900/20 transition hover:bg-slate-800"
        aria-label="Open recognition queue"
      >
        <QueueIcon />
        <span>Queue</span>
        {pendingCount > 0 ? (
          <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1.5 text-[11px] font-bold text-slate-950">
            {pendingCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[60] bg-slate-950/30" onClick={() => setOpen(false)}>
          <aside
            className="fixed bottom-20 right-5 w-[min(92vw,28rem)] overflow-hidden"
            aria-label="Recognition queue"
            onClick={(event) => event.stopPropagation()}
          >
            <Card padding="none" shadow="xl" className="max-h-[72vh] overflow-hidden flex flex-col">
              <header className="border-b border-slate-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-950">
                      <QueueIcon className="h-5 w-5" />
                      Recognition queue
                    </h2>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Pending cards auto-confirm after 2 minutes. You can edit, delete, or confirm during that window.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
                    aria-label="Close recognition queue"
                  >
                    <CloseIcon />
                  </button>
                </div>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto p-5 overscroll-contain space-y-3">
                {submissions.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                    Your queue is empty.
                  </div>
                ) : (
                  submissions.map((submission) => {
                    const pending = submission.status === "pending";

                    return (
                      <article
                        key={submission.id}
                        className={`rounded-2xl border p-4 ${pending ? "border-amber-200 bg-amber-50/50" : "border-emerald-200 bg-emerald-50/50"
                          }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-wrap gap-1.5">
                            {getSubmissionTypes(submission).map((type) => {
                              const meta = COMMENT_TYPE_META[type];
                              return (
                                <span key={type} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${meta.tint}`}>
                                  {meta.emoji} {meta.en}
                                </span>
                              );
                            })}
                          </div>
                          {pending ? (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                              <ClockIcon /> {RecognitionEngine.formatRemaining(submission.createdAt)}
                            </span>
                          ) : (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                              <CheckIcon /> Confirmed
                            </span>
                          )}
                        </div>

                        <div className="mt-2 text-xs leading-5 text-slate-600">
                          <span className="font-semibold text-slate-500">To:</span>{" "}
                          {submission.users.map((user) => `${user.firstName} ${user.lastName}`).join(", ") || "None"}
                        </div>

                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">{submission.comment}</p>

                        {pending ? (
                          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-amber-200/70 pt-3">
                            <button
                              type="button"
                              onClick={() => {
                                onEditPending(submission);
                                setOpen(false);
                              }}
                              className="inline-flex min-h-9 items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
                            >
                              <PencilIcon /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeletePending(submission.id)}
                              className="inline-flex min-h-9 items-center gap-1 rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:border-rose-300 hover:text-rose-700"
                            >
                              <TrashIcon /> Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => onConfirmPending(submission.id)}
                              className="ml-auto inline-flex min-h-9 items-center gap-1 rounded-xl bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
                            >
                              <SendIcon /> Confirm now
                            </button>
                          </div>
                        ) : null}
                      </article>
                    );
                  })
                )}
              </div>
            </Card>
          </aside>
        </div>
      ) : null}
    </>
  );
}
