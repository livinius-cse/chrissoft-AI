import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api';

export type UserRole = 'ADMIN' | 'STAFF';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  role: UserRole | null;
  isAdmin: boolean;
  isStaff: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; user: AuthUser }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('chrissoft_token'));
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('chrissoft_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    const currentToken = localStorage.getItem('chrissoft_token');
    if (!currentToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await authApi.getMe();
      if (res && res.user) {
        const verifiedUser: AuthUser = {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          role: (res.user.role as UserRole) || 'ADMIN',
        };
        setUser(verifiedUser);
        localStorage.setItem('chrissoft_user', JSON.stringify(verifiedUser));
      }
    } catch {
      // Token expired or invalid
      authApi.logout();
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<{ success: boolean; user: AuthUser }> => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, password);
      if (res.token && res.user) {
        const authenticatedUser: AuthUser = {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          role: (res.user.role as UserRole) || 'ADMIN',
        };
        localStorage.setItem('chrissoft_token', res.token);
        localStorage.setItem('chrissoft_user', JSON.stringify(authenticatedUser));
        setToken(res.token);
        setUser(authenticatedUser);
        return { success: true, user: authenticatedUser };
      }
      throw new Error('Authentication response missing user token payload');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setToken(null);
    setUser(null);
  };

  const role = user?.role || null;
  const isAdmin = role === 'ADMIN';
  const isStaff = role === 'STAFF';
  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAdmin,
        isStaff,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
