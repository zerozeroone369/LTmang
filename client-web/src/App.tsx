import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ClientLayout } from './components/ClientLayout';
import { AuthProvider } from './context/AuthContext';
import { CommunitiesPage } from './pages/CommunitiesPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { PlaceholderModulePage } from './pages/PlaceholderModulePage';
import { PostsPage } from './pages/PostsPage';
import { ProfilePage } from './pages/ProfilePage';
import { RegisterPage } from './pages/RegisterPage';
import { StudyGroupsPage } from './pages/StudyGroupsPage';
import { CampusPage } from './pages/CampusPage';

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
            <Route
              path="documents"
              element={
                <PlaceholderModulePage
                  moduleName="Module 4: Tài liệu học tập"
                  moduleOwner="Huy (Full-stack Module)"
                  description="Kho tài liệu slide, đề thi, bài tập; tải lên file PDF/DOCX <20MB và chấm sao đánh giá."
                />
              }
            />
            <Route
              path="qa"
              element={
                <PlaceholderModulePage
                  moduleName="Module 5: Hỏi đáp học thuật (Q&A)"
                  moduleOwner="Huy (Full-stack Module)"
                  description="Đặt câu hỏi môn học, trả lời, upvote điểm hữu ích và đánh dấu câu trả lời đúng."
                />
              }
            />
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
