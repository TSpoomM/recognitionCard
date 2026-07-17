export type HistoryItem = {
  id: string;
  recipient: {
    user_id: string;
    firstName: string;
    lastName: string;
    email: string;
    role?: string;
    branch?: string;
    branchDesc?: string;
    branchNameEn?: string;
  };
  senderName: string;
  comment: string;
  coreValues: string[];
  createdDate: string | null;
  year: number | null;
  starComment?: string;
};