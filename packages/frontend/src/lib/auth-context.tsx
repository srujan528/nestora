'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useState } from 'react';
import { useTRPC } from './trpc';

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string | null;
  role: 'STUDENT' | 'OWNER' | 'ADMIN';
  emailVerified: boolean;
  phoneVerified: boolean;
  studentProfile?: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role?: 'STUDENT' | 'OWNER', phone?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const trpc = useTRPC();

  const loginMutation = useMutation(
    trpc.auth.login.mutationOptions()
  );
  const registerMutation = useMutation(
    trpc.auth.register.mutationOptions()
  );
  const userQuery = useQuery({
    ...trpc.auth.me.queryOptions(),
    enabled: !!token,
    retry: false,
  });

  useEffect(() => {
    const storedToken = localStorage.getItem('auth-token');
    if (storedToken) {
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem('auth-token', token);
    } else {
      localStorage.removeItem('auth-token');
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const result = await (loginMutation.mutateAsync as any)({ email, password });
    setToken(result.token);
    userQuery.refetch();
  };

  const register = async (email: string, password: string, name: string, role: 'STUDENT' | 'OWNER' = 'STUDENT', phone?: string) => {
    const result = await (registerMutation.mutateAsync as any)({ email, password, name, role, phone });
    setToken(result.token);
    userQuery.refetch();
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('auth-token');
    window.location.href = '/';
  };

  const refreshUser = () => {
    userQuery.refetch();
  };

  const contextValue: AuthContextType = {
    user: (userQuery.data as unknown as User) || null,
    token,
    isLoading: isLoading || (!!token && userQuery.isLoading),
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
