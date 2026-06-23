export interface User {
  user_id: string;
  firstName: string;
  lastName: string;
  email: string;
  photoUrl: string;
  role?: string; // e.g. "Product Designer"
  team?: string; // e.g. "Design"
};