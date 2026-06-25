'use client';

import { useMemo, useState } from "react";
import { PendingSubmission } from "../../../types/pendingSubmission";
import { COMMENT_TYPE_META } from "../../../types/commentType";
import { RecognitionEngine } from "../../../lib/RecognitionEngine";
import Card from "../../ui/Card";
import { Logs, Clock, Check, Pencil, Trash, Send, X } from 'lucide-react';

type RecognitionQueueButtonProps = {
  submissions: PendingSubmission[];
  onEditPending: (submission: PendingSubmission) => void;
  onDeletePending: (submissionId: string) => void;
  onConfirmPending: (submissionId: string) => void;
};

function QueueIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <Logs className={className} stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
  );
}

function ClockIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <Clock className={className} stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  );
}

function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <Check className={className} stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  );
}

function PencilIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <Pencil className={className} stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  );
}

function TrashIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <Trash className={className} stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  );
}

function SendIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <Send className={className} stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  );
}

function CloseIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <X className={className} stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  );
}

function getSubmissionTypes(submission: PendingSubmission) {
  console.log("submission.types =", submission.types);
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
            className="fixed bottom-20 right-5 w-[min(94vw,34rem)] overflow-hidden"
            aria-label="Recognition queue"
            onClick={(event) => event.stopPropagation()}
          >
            <Card padding="none" shadow="xl" className="max-h-[80vh] overflow-hidden flex flex-col">
              <header className="border-b border-slate-200 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-950">
                      <QueueIcon className="h-6 w-6" />
                      Recognition queue
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Pending cards auto-confirm after 2 minutes. You can edit, delete, or confirm during that window.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
                    aria-label="Close recognition queue"
                  >
                    <CloseIcon />
                  </button>
                </div>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto p-6 overscroll-contain space-y-4">
                {submissions.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-base text-slate-500">
                    Your queue is empty.
                  </div>
                ) : (
                  submissions.map((submission) => {
                    const pending = submission.status === "pending";

                    return (
                      <article
                        key={submission.id}
                        className={`rounded-2xl border p-5 ${pending ? "border-amber-200 bg-amber-50/50" : "border-emerald-200 bg-emerald-50/50"
                          }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-wrap gap-1.5">
                            {getSubmissionTypes(submission).map((type) => {
                              const meta = COMMENT_TYPE_META[type];
                              console.log("type =", type);
                              console.log("meta =", meta);
                              if (!meta) return null;
                              return (
                                <span key={type} className={`rounded-full px-2.5 py-1 text-[13px] font-bold ${meta.tint}`}>
                                  {meta.emoji} {meta.en}
                                </span>
                              );
                            })}
                          </div>
                          {pending ? (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[13px] font-bold text-amber-800">
                              <ClockIcon /> {RecognitionEngine.formatRemaining(submission.createdAt)}
                            </span>
                          ) : (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[13px] font-bold text-emerald-800">
                              <CheckIcon /> Confirmed
                            </span>
                          )}
                        </div>

                        <div className="mt-3 text-sm leading-6 text-slate-700">
                          <span className="font-bold text-slate-800">To:</span>{" "}
                          {submission.users.map((user) => `${user.firstName} ${user.lastName}`).join(", ") || "None"}
                        </div>

                        <p className="mt-3 whitespace-pre-wrap text-base sm:text-[17px] leading-relaxed font-medium text-slate-900">{submission.comment}</p>

                        {pending ? (
                          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-amber-200/70 pt-4">
                            <button
                              type="button"
                              onClick={() => {
                                onEditPending(submission);
                                setOpen(false);
                              }}
                              className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
                            >
                              <PencilIcon /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeletePending(submission.id)}
                              className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:text-rose-700"
                            >
                              <TrashIcon /> Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => onConfirmPending(submission.id)}
                              className="ml-auto inline-flex min-h-10 items-center gap-1 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
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
