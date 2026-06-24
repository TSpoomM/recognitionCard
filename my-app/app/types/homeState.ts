import { CommentType } from "./commentType";
import { PendingSubmission } from "./pendingSubmission";
import { User } from "./user";

export type HomeState = {
  currentStep: number;
  users: User[];
  isLoadingUsers: boolean;
  selectedUserIds: string[];
  selectedTypes: CommentType[];
  comment: string;
  searchQuery: string;
  pendingSubmissions: PendingSubmission[];
  editingId: string | null;
  formError: string;
  formSuccess: string;
};
