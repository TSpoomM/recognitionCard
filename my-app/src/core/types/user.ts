export interface User {
  user_id: string;
  firstName: string;
  lastName: string;
  thaiName?: string;
  email: string;
  photoUrl?: string;
  role?: string; // e.g. "Product Designer"
  team?: string; // e.g. "Design"
  location?: string; // e.g. "Bangkok", "Chiang Mai"
  branchDesc?: string;
  branchNameEn?: string;
};
