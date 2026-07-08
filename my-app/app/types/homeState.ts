import { CommentType } from "./commentType";
import { PendingSubmission } from "./pendingSubmission";
import { User } from "./user";
import { CardLanguage } from "./cardLanguage";

export type HomeState = {
  currentStep: number;
  currentUserId: string;
  users: User[];
  isLoadingUsers: boolean;
  selectedUserIds: string[];
  selectedTypes: CommentType[];
  selectedCardLanguage: CardLanguage;
  comment: string;
  searchQuery: string;
  selectedBranch: string;
  pendingSubmissions: PendingSubmission[];
  editingId: string | null;
  formError: string;
  formSuccess: string;
};
