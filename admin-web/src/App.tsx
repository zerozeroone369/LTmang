import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminLayout } from './components/AdminLayout';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/auth-context';
import { AcademicPage } from './pages/AcademicPage';
import { CampusPage } from './pages/CampusPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { LogsSettingsPage } from './pages/LogsSettingsPage';
import { ModerationPage } from './pages/ModerationPage';
import { UsersPage } from './pages/UsersPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Đang kiểm tra phiên đăng nhập Quản trị...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="moderation" element={<ModerationPage />} />
            <Route path="campus" element={<CampusPage />} />
            <Route path="academic" element={<AcademicPage />} />
            <Route path="settings" element={<LogsSettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
