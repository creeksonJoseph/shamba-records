import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { api, tokenStore, type AuthUser, type Role } from "./api";

interface LoginResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  role: Role | null;
  hasRole: (r: Role) => boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => tokenStore.getUser());

  const login = useCallback(async (email: string, password: string) => {
    const data = await api<LoginResponse>("/auth/login/", {
      method: "POST",
      body: { email, password },
      auth: false,
    });
    tokenStore.set(data.access, data.refresh, data.user);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      isAuthenticated: !!user,
      role: user?.role ?? null,
      hasRole: (r) => user?.role === r,
      login,
      logout,
    }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
