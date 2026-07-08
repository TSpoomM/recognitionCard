import { User } from "./user";
import { CommentType } from "./commentType";
import { CardLanguage } from "./cardLanguage";

export interface PendingSubmission {
  id: string;
  users: User[];
  types: CommentType[];
  type?: CommentType;
  cardLanguage: CardLanguage;
  comment: string;
  createdAt: number;
  status: "pending" | "sent";
};
