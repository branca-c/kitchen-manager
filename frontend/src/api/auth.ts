import { apiClient } from './client';
import type { AuthSession, User } from '../types/auth';

type LoginCredentials = {
  username: string;
  password: string;
};

type RegisterInput = {
  username: string;
  email?: string;
  password: string;
  passwordConfirm: string;
};

type LoginApiResponse = {
  access: string;
  refresh: string;
  role: AuthSession['role'];
  user_id: number;
};

type UserApiResponse = {
  id: number;
  username: string;
  email: string;
  role: User['role'];
};

function mapUser(response: UserApiResponse): User {
  return {
    id: response.id,
    username: response.username,
    email: response.email,
    role: response.role,
  };
}

export async function fetchCurrentUser(accessToken?: string) {
  const response = await apiClient.get<UserApiResponse>('auth/me/', {
    headers: accessToken
      ? {
          Authorization: `Bearer ${accessToken}`,
        }
      : undefined,
  });

  return mapUser(response.data);
}

export async function loginUser(credentials: LoginCredentials): Promise<AuthSession> {
  const response = await apiClient.post<LoginApiResponse>('auth/login/', credentials);
  const user = await fetchCurrentUser(response.data.access);

  return {
    accessToken: response.data.access,
    refreshToken: response.data.refresh,
    role: response.data.role,
    user,
  };
}

export async function registerUser(input: RegisterInput) {
  const response = await apiClient.post<UserApiResponse>('auth/register/', {
    username: input.username,
    email: input.email || '',
    password: input.password,
    password_confirm: input.passwordConfirm,
  });

  return mapUser(response.data);
}
