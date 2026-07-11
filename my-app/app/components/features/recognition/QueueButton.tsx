'use client';

import { useEffect, useMemo, useState } from "react";
import { PendingSubmission } from "../../../types/pendingSubmission";
import { COMMENT_TYPE_META } from "../../../types/commentType";
import { RecognitionEngine } from "../../../lib/RecognitionEngine";
import Card from "../../ui/Card";
import { useLanguage } from "../../../context/LanguageContext";
import { QueueIcon, ClockIcon, CheckIcon, PencilIcon, TrashIcon, SendIcon, CloseIcon } from "../../ui/Icons";

type RecognitionQueueButtonProps = {
  submissions: PendingSubmission[];
  editingSubmissionId?: string | null;
  onEditPending: (submission: PendingSubmission) => void;
  onDeletePending: (submissionId: string) => void;
  onConfirmPending: (submissionId: string) => void;
};

function getSubmissionTypes(submission: PendingSubmission) {
  return submission.types?.length ? submission.types : submission.type ? [submission.type] : [];
}

export default function RecognitionQueueButton({
  submissions,
  editingSubmissionId = null,
  onEditPending,
  onDeletePending,
  onConfirmPending,
}: RecognitionQueueButtonProps) {
  const [open, setOpen] = useState(false);
  const [, setTick] = useState(0);
  const { t } = useLanguage();
  const pendingCount = useMemo(() => submissions.filter((item) => item.status === "pending").length, [submissions]);

  useEffect(() => {
    if (pendingCount <= 0) return;
    const timer = window.setTimeout(() => setOpen(true), 0);
    return () => window.clearTimeout(timer);
  }, [pendingCount]);

  useEffect(() => {
    if (!open) return;

    const intervalId = window.setInterval(() => {
      setTick((tick) => tick + 1);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 inline-flex min-h-12 items-center gap-2 rounded-full bg-teal-800 px-5 py-3 text-base font-semibold text-white shadow-xl shadow-teal-900/25 transition hover:bg-teal-900"
        aria-label="Open recognition queue"
      >
        <QueueIcon />
        <span>{t.queue}</span>
        {pendingCount > 0 ? (
          <span className="ml-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-amber-400 px-1.5 text-xs font-bold text-slate-950">
            {pendingCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[60] bg-slate-950/30 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <aside
            className="fixed bottom-20 right-5 w-[min(94vw,34rem)] overflow-hidden"
            aria-label="Recognition queue"
            onClick={(event) => event.stopPropagation()}
          >
            <Card padding="none" shadow="xl" className="max-h-[80vh] overflow-hidden flex flex-col">
              <header className="border-b-[1.5px] border-amber-300 bg-teal-50/40 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-950">
                      <QueueIcon className="h-6 w-6" />
                      {t.queueTitle}
                    </h2>
                    <p className="mt-2 text-base leading-7 text-slate-600">
                      {t.queueDescription}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[1.5px] border-amber-300 bg-white text-slate-500 transition hover:border-amber-400 hover:text-teal-900"
                    aria-label="Close recognition queue"
                  >
                    <CloseIcon />
                  </button>
                </div>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto p-6 overscroll-contain space-y-4">
                {submissions.length === 0 ? (
                  <div className="app-muted-panel rounded-2xl border-dashed p-10 text-center text-base text-slate-500">
                    {t.queueEmpty}
                  </div>
                ) : (
                  submissions.map((submission) => {
                    const pending = submission.status === "pending";
                    const editing = editingSubmissionId === submission.id;

                    return (
                      <article
                        key={submission.id}
                        className={`rounded-2xl border-[1.5px] p-5 ${pending ? "border-amber-300 bg-amber-50/50" : "border-emerald-300 bg-emerald-50/50"
                          }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          {/* <div className="flex flex-wrap gap-1.5">
                            {getSubmissionTypes(submission).map((type) => {
                              const meta = COMMENT_TYPE_META[type];
                              if (!meta) return null;
                              return (
                                <span key={type} className={`rounded-full px-3 py-1.5 text-sm font-bold ${meta.tint}`}>
                                  {meta.emoji} {submission.cardLanguage === "th" ? meta.th : meta.en}
                                </span>
                              );
                            })}
                          </div> */}
                          <div className="flex flex-wrap">
                            <span className="inline-flex rounded-full bg-teal-100 px-3 py-1.5 text-sm font-bold text-teal-800">
                              {submission.cardLanguage === "th" ? "ภาษาไทย" : "English"}
                            </span>
                          </div>

                          {editing ? (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-600">
                              <PencilIcon /> {t.editing}
                            </span>
                          ) : pending ? (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-bold text-amber-800">
                              <ClockIcon /> {RecognitionEngine.formatRemaining(submission.createdAt)}
                            </span>
                          ) : (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-bold text-emerald-800">
                              <CheckIcon /> {t.queueConfirmed}
                            </span>
                          )}
                        </div>

                        {/* <div className="mt-3">
                          <span className="inline-flex rounded-full bg-teal-100 px-3 py-1.5 text-sm font-bold text-teal-800">
                            {submission.cardLanguage === "th" ? "ภาษาไทย" : "English"}
                          </span>
                        </div> */}

                        <div className="mt-3 text-base leading-7 text-slate-700">
                          <span className="font-bold text-slate-800">{t.queueTo}</span>{" "}
                          {submission.users.map((user) => `${user.firstName} ${user.lastName}`).join(", ") || "None"}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {getSubmissionTypes(submission).map((type) => {
                            const meta = COMMENT_TYPE_META[type];
                            if (!meta) return null;
                            return (
                              <span key={type} className={`rounded-full px-3 py-1.5 text-sm font-bold ${meta.tint}`}>
                                {meta.emoji} {submission.cardLanguage === "th" ? meta.th : meta.en}
                              </span>
                            );
                          })}
                        </div>

                        <p className="mt-3 whitespace-pre-wrap text-lg leading-relaxed font-medium text-slate-900">{submission.comment}</p>

                        {pending ? (
                          <div className="mt-4 flex flex-wrap items-center gap-2 border-t-[1.5px] border-amber-300/70 pt-4">
                            <button
                              type="button"
                              onClick={() => {
                                onEditPending(submission);
                                setOpen(false);
                              }}
                              className="inline-flex min-h-10 items-center gap-1 rounded-xl border-[1.5px] border-amber-300 bg-white px-4 py-2 text-base font-semibold text-slate-700 transition hover:border-amber-400 hover:bg-amber-50 hover:text-teal-950"
                            >
                              <PencilIcon /> {t.edit}
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeletePending(submission.id)}
                              className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-rose-200 bg-white px-4 py-2 text-base font-semibold text-rose-600 transition hover:border-rose-300 hover:text-rose-700"
                            >
                              <TrashIcon /> {t.cancel}
                            </button>
                            <button
                              type="button"
                              onClick={() => onConfirmPending(submission.id)}
                              disabled={editing}
                              title={editing ? "Finish editing before confirming this card." : undefined}
                              className="ml-auto inline-flex min-h-10 items-center gap-1 rounded-xl bg-teal-800 px-4 py-2 text-base font-semibold text-white transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
                            >
                              <SendIcon /> {editing ? t.editing : t.confirmNow}
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
        </div >
      ) : null
      }
    </>
  );
}
