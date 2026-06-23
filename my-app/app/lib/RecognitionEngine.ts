import { CommentType } from "../types/commentType";
import { PendingSubmission } from "../types/pendingSubmission";
import { User } from "../types/user";

export class RecognitionEngine {
  static STORAGE_KEY = "recognition-card-submissions";
  static PENDING_WINDOW_MS = 2 * 60 * 1000;

  private constructor() {}

  static countAlphabetLetters(text: string) {
    return Array.from(text).filter((char) => /\p{L}/u.test(char)).length;
  }

  static formatRemaining(createdAt: number) {
    const remaining = Math.max(0, this.PENDING_WINDOW_MS - (Date.now() - createdAt));
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  static formatCreatedAt(timestamp: number) {
    return new Date(timestamp).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  static normalizeSubmission(raw: unknown): PendingSubmission | null {
    if (!raw || typeof raw !== "object") return null;
    const submission = raw as Record<string, unknown>;

    const users = Array.isArray(submission.users) ? (submission.users as User[]) : [];
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
  }

  static loadSubmissions(): PendingSubmission[] {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      return parsed
        .map((item) => this.normalizeSubmission(item))
        .filter((item): item is PendingSubmission => item !== null);
    } catch {
      window.localStorage.removeItem(this.STORAGE_KEY);
      return [];
    }
  }

  static saveSubmissions(submissions: PendingSubmission[]) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(submissions));
  }

  static createPendingSubmission(users: User[], types: CommentType[], comment: string): PendingSubmission {
    return {
      id: `${Date.now()}`,
      users,
      types,
      comment,
      createdAt: Date.now(),
      status: "pending",
    };
  }

  static updatePendingStatuses(submissions: PendingSubmission[]): PendingSubmission[] {
    return submissions.map((submission) => {
      if (submission.status === "sent") return submission;

      const elapsed = Date.now() - submission.createdAt;
      if (elapsed >= this.PENDING_WINDOW_MS) {
        return { ...submission, status: "sent" };
      }

      return submission;
    });
  }
}
