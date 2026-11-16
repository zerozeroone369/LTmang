import React, { useEffect, useState } from 'react';
import { authApi } from '../api/authApi';
import { TOKEN_STORAGE_KEY } from '../api/client';
import { UserDTO } from '../types/auth';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const me = await authApi.me();
      setUser(me);
    } catch {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setUser(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }
    fetchProfile().finally(() => setIsLoading(false));
  }, []);

  const login = async (identifier: string, password: string) => {
    const data = await authApi.login(identifier, password);
    localStorage.setItem(TOKEN_STORAGE_KEY, data.accessToken);
    setUser(data.user);
  };

  const register = async (payload: {
    fullName: string;
    email: string;
    studentCode?: string;
    password: string;
    phone?: string;
    schoolId?: number;
    facultyId?: number;
    majorId?: number;
    courseId?: number;
    classId?: number;
  }) => {
    const data = await authApi.register(payload);
    localStorage.setItem(TOKEN_STORAGE_KEY, data.accessToken);
    setUser(data.user);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
