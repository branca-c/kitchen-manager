import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import type { AuthSession, User } from '../types/auth';
import { clearStoredAuthState, loadStoredAuthState, saveStoredAuthState } from '../utils/storage';

type AuthContextValue = {
  accessToken: string | null;
  refreshToken: string | null;
  role: AuthSession['role'] | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (session: AuthSession) => void;
  logout: () => void;
  setCurrentUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  role: AuthSession['role'] | null;
  user: User | null;
};

const emptyState: AuthState = {
  accessToken: null,
  refreshToken: null,
  role: null,
  user: null,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => loadStoredAuthState() ?? emptyState);

  const login = (session: AuthSession) => {
    setState(() => {
      const nextState: AuthState = {
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        role: session.role,
        user: session.user ?? null,
      };

      saveStoredAuthState(nextState);
      return nextState;
    });
  };

  const logout = () => {
    setState(emptyState);
    clearStoredAuthState();
  };

  const setCurrentUser = (user: User) => {
    setState((currentState) => {
      const nextState = {
        ...currentState,
        role: user.role,
        user,
      };

      saveStoredAuthState(nextState);
      return nextState;
    });
  };

  const value: AuthContextValue = {
    ...state,
    isAuthenticated: Boolean(state.accessToken),
    login,
    logout,
    setCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
