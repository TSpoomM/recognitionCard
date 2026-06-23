import { CommentType } from "./commentType";
import { PendingSubmission } from "./pendingSubmission";

export type HomeState = {
  currentStep: number;
  selectedUserIds: string[];
  selectedTypes: CommentType[];
  comment: string;
  searchQuery: string;
  pendingSubmissions: PendingSubmission[];
  editingId: string | null;
  formError: string;
  formSuccess: string;
};
