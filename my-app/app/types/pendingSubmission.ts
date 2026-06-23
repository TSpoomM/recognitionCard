import { User } from "./user";
import { CommentType } from "./commentType";

export interface PendingSubmission {
  id: string;
  users: User[];
  types: CommentType[];
  type?: CommentType;
  comment: string;
  createdAt: number;
  status: "pending" | "sent";
};
