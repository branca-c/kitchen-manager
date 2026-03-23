export type UserRole = 'admin' | 'customer';

export type User = {
  id: number;
  username: string;
  email: string;
  role: UserRole;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  role: UserRole;
  user?: User | null;
};
