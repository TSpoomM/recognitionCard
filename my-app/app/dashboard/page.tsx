'use client';

import Link from "next/link";
import { ChangeEvent, Component } from "react";
import { CommentType, COMMENT_TYPES } from "../types/commentType";
import { PendingSubmission } from "../types/pendingSubmission";
import { RecognitionEngine } from "../lib/RecognitionEngine";
import Card from "../components/ui/Card";

type DashboardState = {
  selectedType: CommentType | "ALL";
  sortOrder: "newest" | "oldest";
  submissions: PendingSubmission[];
};

export default class DashboardPage extends Component<Record<string, never>, DashboardState> {
  constructor(props: Record<string, never>) {
    super(props);

    this.state = {
      selectedType: "ALL",
      sortOrder: "newest",
      submissions: RecognitionEngine.loadSubmissions(),
    };
  }

  private get filteredSubmissions() {
    const { selectedType, sortOrder, submissions } = this.state;
    const filteredByType =
      selectedType === "ALL"
        ? submissions
        : submissions.filter((item) => this.getSubmissionTypes(item).includes(selectedType));

    return [...filteredByType].sort((a, b) =>
      sortOrder === "newest" ? b.createdAt - a.createdAt : a.createdAt - b.createdAt
    );
  }

  private get pendingCount() {
    return this.state.submissions.filter((item) => item.status === "pending").length;
  }

  private get sentCount() {
    return this.state.submissions.filter((item) => item.status === "sent").length;
  }

  private getSubmissionTypes(submission: PendingSubmission) {
    return submission.types.length > 0 ? submission.types : submission.type ? [submission.type] : [];
  }

  private handleTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    this.setState({ selectedType: event.target.value as CommentType | "ALL" });
  };

  private handleSortChange = (event: ChangeEvent<HTMLSelectElement>) => {
    this.setState({ sortOrder: event.target.value as "newest" | "oldest" });
  };

  render() {
    const { selectedType, sortOrder } = this.state;
    const filtered = this.filteredSubmissions;

    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Card bordered={false} padding="xl" shadow="xl" className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-2 text-sm uppercase tracking-[0.2em] text-slate-500">Dashboard</p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Monitor recognition comments
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Filter by comment type, sort by created date, and review pending or sent cards.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex h-14 items-center justify-center rounded-3xl bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Back to form
            </Link>
          </Card>

          <div className="mb-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Card padding="lg">
              <h2 className="mb-4 text-xl font-semibold text-slate-900">Filters</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-900">Comment type</label>
                  <select
                    value={selectedType}
                    onChange={this.handleTypeChange}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="ALL">All types</option>
                    {COMMENT_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-900">Sort by date</label>
                  <select
                    value={sortOrder}
                    onChange={this.handleSortChange}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                  </select>
                </div>
              </div>
            </Card>

            <Card padding="lg">
              <h2 className="mb-4 text-xl font-semibold text-slate-900">Status summary</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Card bordered={false} surface="muted" shadow="none" className="text-slate-700">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Pending</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">{this.pendingCount}</p>
                </Card>
                <Card bordered={false} surface="muted" shadow="none" className="text-slate-700">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Sent</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">{this.sentCount}</p>
                </Card>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            {filtered.length === 0 ? (
              <Card surface="muted" padding="lg" className="text-slate-600">
                No comments match the selected filters.
              </Card>
            ) : (
              filtered.map((submission) => (
                <Card key={submission.id} padding="lg">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
                    <div>
                      <p className="text-sm text-slate-500">{submission.status === "pending" ? "Pending" : "Sent"}</p>
                      <p className="text-xl font-semibold text-slate-900">
                        {this.getSubmissionTypes(submission).join(", ") || "Unknown type"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-700 shadow-sm">
                      {RecognitionEngine.formatCreatedAt(submission.createdAt)}
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Users</p>
                      <ul className="mt-3 space-y-2 text-sm text-slate-600">
                        {submission.users.map((user) => (
                          <li key={user.user_id}>
                            {user.firstName} {user.lastName} - {user.email}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Comment</p>
                      <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{submission.comment}</p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }
}
