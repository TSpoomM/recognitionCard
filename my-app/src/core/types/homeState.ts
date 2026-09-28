import { CommentType } from "./commentType";
import { PendingSubmission } from "./pendingSubmission";
import { User } from "./user";
import { CardLanguage } from "./cardLanguage";
import type { StarSections } from "./starSections";

export type HomeState = {
  currentStep: number;
  currentUserId: string;
  users: User[];
  isLoadingUsers: boolean;
  selectedUserIds: string[];
  selectedTypes: CommentType[];
  selectedCardLanguage: CardLanguage;
  comment: string;
  starSections: StarSections;
  previewConfirmed: boolean;
  searchQuery: string;
  selectedBranch: string;
  pendingSubmissions: PendingSubmission[];
  editingId: string | null;
  formError: string;
  formSuccess: string;
};
