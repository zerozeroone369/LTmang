import React, { useEffect, useState } from 'react';
import { adminApi } from '../api/adminApi';
import { TOKEN_STORAGE_KEY } from '../api/client';
import { UserDTO } from '../types/admin';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }

    adminApi
      .me()
      .then((me) => {
        if (me.role !== 'ADMIN') {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          setUser(null);
        } else {
          setUser(me);
        }
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = async (identifier: string, password: string) => {
    const data = await adminApi.login(identifier, password);
    if (data.user.role !== 'ADMIN') {
      throw new Error('Tài khoản sinh viên không có quyền truy cập Cổng Quản Trị (Admin Portal).');
    }
    localStorage.setItem(TOKEN_STORAGE_KEY, data.accessToken);
    setUser(data.user);
  };

  const logout = async () => {
    try {
      await adminApi.logout();
    } catch {
      // Ignore network error during logout cleanup
    } finally {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
