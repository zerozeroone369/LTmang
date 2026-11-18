import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ClientLayout } from './components/ClientLayout';
import { AuthProvider } from './context/AuthContext';
import { CampusPage } from './pages/CampusPage';
import { CommunitiesPage } from './pages/CommunitiesPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { PostsPage } from './pages/PostsPage';
import { ProfilePage } from './pages/ProfilePage';
import { QAPage } from './pages/QAPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudyGroupsPage } from './pages/StudyGroupsPage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors closeButton />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<ClientLayout />}>
            <Route index element={<HomePage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="communities" element={<CommunitiesPage />} />
            <Route path="posts" element={<PostsPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="qa" element={<QAPage />} />
            <Route path="study-groups" element={<StudyGroupsPage />} />
            <Route path="campus" element={<CampusPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
