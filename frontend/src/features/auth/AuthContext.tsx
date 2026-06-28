import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authApi } from './authApi';
import { ACCESS_TOKEN_STORAGE_KEY } from './constants';
import { LoginPayload, SignupPayload, User } from './types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (!token) {
      setIsInitializing(false);
      return;
    }

    authApi
      .me()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
        setUser(null);
      })
      .finally(() => setIsInitializing(false));
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const result = await authApi.login(payload);
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, result.accessToken);
    setUser(result.user);
  }, []);

  const signup = useCallback(async (payload: SignupPayload) => {
    const result = await authApi.signup(payload);
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, result.accessToken);
    setUser(result.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: !!user, isInitializing, login, signup, logout }),
    [user, isInitializing, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- context hook must live beside its provider
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
