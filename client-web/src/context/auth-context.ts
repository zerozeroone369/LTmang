import { createContext, useContext } from 'react';
import { UserDTO } from '../types/auth';

export interface AuthContextValue {
  user: UserDTO | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (payload: {
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
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
