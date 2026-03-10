export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  fullName?: string;
  avatarUrl?: string;
  phone?: string;
  department?: string;
  position?: string;
  createdAt: string;
  updatedAt: string;
}
