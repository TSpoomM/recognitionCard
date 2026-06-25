export type HistoryItem = {
  id: string;
  recipient: {
    user_id: string;
    firstName: string;
    lastName: string;
    email: string;
    role?: string;
  };
  comment: string;
  coreValues: string[];
  createdDate: string | null;
};
