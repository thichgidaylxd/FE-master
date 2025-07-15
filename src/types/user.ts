export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "manager" | "staff";
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
}
