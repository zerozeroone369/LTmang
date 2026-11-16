import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DesktopAppLayout } from './components/DesktopAppLayout';
import { LoginPage } from './pages/LoginPage';
import { CommunitiesPage } from './pages/CommunitiesPage';
import { PostsPage } from './pages/PostsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors closeButton />
        <DesktopAppLayout>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <PostsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/posts"
              element={
                <ProtectedRoute>
                  <PostsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/communities"
              element={
                <ProtectedRoute>
                  <CommunitiesPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DesktopAppLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
