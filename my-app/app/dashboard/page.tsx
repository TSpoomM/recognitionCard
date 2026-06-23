'use client';

import Link from "next/link";
import { useMemo, useState } from "react";
import { CommentType, COMMENT_TYPES } from "../types/commentType";
import { PendingSubmission } from "../types/pendingSubmission";
import { User } from "../types/user";

const STORAGE_KEY = "recognition-card-submissions";

const formatCreatedAt = (timestamp: number) =>
  new Date(timestamp).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

export default function DashboardPage() {
  const [selectedType, setSelectedType] = useState<CommentType | "ALL">("ALL");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const normalizeSubmission = (raw: unknown): PendingSubmission | null => {
    if (!raw || typeof raw !== "object") return null;
    const submission = raw as Record<string, unknown>;

    const users = Array.isArray(submission.users)
      ? (submission.users as User[])
      : [];
    const comment = typeof submission.comment === "string" ? submission.comment : "";
    const createdAt = typeof submission.createdAt === "number" ? submission.createdAt : Date.now();
    const status = submission.status === "sent" ? "sent" : "pending";

    const types = Array.isArray(submission.types)
      ? (submission.types as CommentType[])
      : typeof submission.type === "string"
        ? [submission.type as CommentType]
        : [];

    return {
      id: typeof submission.id === "string" ? submission.id : `${createdAt}`,
      users,
      types,
      type: typeof submission.type === "string" ? (submission.type as CommentType) : undefined,
      comment,
      createdAt,
      status,
    };
  };

  const [submissions] = useState<PendingSubmission[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    try {
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];

      return parsed
        .map((item) => normalizeSubmission(item))
        .filter((item): item is PendingSubmission => item !== null);
    } catch {
      return [];
    }
  });

  const getSubmissionTypes = (submission: PendingSubmission) =>
    submission.types.length > 0 ? submission.types : submission.type ? [submission.type] : [];

  const filtered = useMemo(() => {
    const filteredByType =
      selectedType === "ALL"
        ? submissions
        : submissions.filter((item) => getSubmissionTypes(item).includes(selectedType));

    return [...filteredByType].sort((a, b) =>
      sortOrder === "newest" ? b.createdAt - a.createdAt : a.createdAt - b.createdAt
    );
  }, [selectedType, sortOrder, submissions]);

  const pendingCount = submissions.filter((item) => item.status === "pending").length;
  const sentCount = submissions.filter((item) => item.status === "sent").length;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-4 rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/80 sm:flex-row sm:items-center sm:justify-between">
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
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">Filters</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-900">Comment type</label>
                <select
                  value={selectedType}
                  onChange={(event) => setSelectedType(event.target.value as CommentType | "ALL")}
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
                  onChange={(event) => setSortOrder(event.target.value as "newest" | "oldest")}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">Status summary</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-5 text-slate-700">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Pending</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{pendingCount}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5 text-slate-700">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Sent</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{sentCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-600">
              No comments match the selected filters.
            </div>
          ) : (
            filtered.map((submission) => (
              <div key={submission.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
                  <div>
                    <p className="text-sm text-slate-500">{submission.status === "pending" ? "Pending" : "Sent"}</p>
                    <p className="text-xl font-semibold text-slate-900">
                      {getSubmissionTypes(submission).join(", ") || "Unknown type"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-700 shadow-sm">
                    {formatCreatedAt(submission.createdAt)}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Users</p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      {submission.users.map((user) => (
                        <li key={user.user_id}>
                          {user.firstName} {user.lastName} � {user.email}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Comment</p>
                    <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{submission.comment}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
