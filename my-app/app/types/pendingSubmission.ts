import { User } from "./user";
import { CommentType } from "./commentType";
import { CardLanguage } from "./cardLanguage";
import type { StarSections } from "../components/features/starComment/RecognitionCommentStep";

export interface PendingSubmission {
  id: string;
  users: User[];
  types: CommentType[];
  type?: CommentType;
  cardLanguage: CardLanguage;
  comment: string;
  starSections?: StarSections;
  createdAt: number;
  status: "pending" | "sent";
};
