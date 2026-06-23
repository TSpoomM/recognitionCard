'use client';

import { Component } from "react";
import { PendingSubmission } from "../../../types/pendingSubmission";
import { RecognitionEngine } from "../../../lib/RecognitionEngine";
import { COMMENT_TYPE_META } from "../../../types/commentType";
import Card from "../../ui/Card";

type RecognitionPendingPanelProps = {
  submissions: PendingSubmission[];
  onEditPending: (submission: PendingSubmission) => void;
  onDeletePending: (submissionId: string) => void;
};

export default class RecognitionPendingPanel extends Component<RecognitionPendingPanelProps> {
  private get pendingCount() {
    return this.props.submissions.filter((item) => item.status === "pending").length;
  }

  private get sentSubmissions() {
    return this.props.submissions.filter((item) => item.status === "sent");
  }

  private getSubmissionTypes(submission: PendingSubmission) {
    return submission.types?.length ? submission.types : submission.type ? [submission.type] : [];
  }

  render() {
    const { submissions, onEditPending, onDeletePending } = this.props;

    return (
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card padding="lg">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Pending reviews</h2>
              <p className="text-sm text-slate-600">
                Edit or delete before the card is automatically sent to the database.
              </p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
              {this.pendingCount} pending
            </span>
          </div>

          <div className="space-y-4">
            {submissions.length === 0 ? (
              <Card bordered={false} surface="muted" padding="lg" shadow="none" className="text-slate-600">
                No recognition cards submitted yet.
              </Card>
            ) : (
              submissions.map((submission) => (
                <Card key={submission.id} surface="muted">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
                    <div>
                      <p className="text-sm text-slate-500">Types</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {this.getSubmissionTypes(submission).map((type) => {
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
                            {user.firstName} {user.lastName} - {user.role ?? user.email}
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
                </Card>
              ))
            )}
          </div>
        </Card>

        <Card padding="lg">
          <h2 className="mb-3 text-xl font-semibold text-slate-900">Sent cards</h2>
          <p className="mb-6 text-sm text-slate-600">
            After 2 minutes your pending card is marked as sent. This simulates the database send step.
          </p>
          <div className="space-y-4">
            {this.sentSubmissions.length === 0 ? (
              <Card bordered={false} surface="muted" shadow="none" className="text-slate-600">
                No cards have been sent yet.
              </Card>
            ) : (
              this.sentSubmissions.map((submission) => (
                <Card key={submission.id} bordered={false} surface="muted" padding="sm" shadow="none">
                  <p className="text-sm font-semibold text-slate-900">{this.getSubmissionTypes(submission).join(", ")}</p>
                  <p className="mt-2 text-sm text-slate-700">{submission.comment}</p>
                </Card>
              ))
            )}
          </div>
        </Card>
      </div>
    );
  }
}
