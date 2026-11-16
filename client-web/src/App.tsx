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
            <Route
              path="study-groups"
              element={
                <PlaceholderModulePage
                  moduleName="Module 6: Nhóm học (Study Groups)"
                  moduleOwner="Bảo (Full-stack Module)"
                  description="Tìm bạn học cùng mục tiêu, tạo nhóm học mới, xin gia nhập và trưởng nhóm duyệt đơn."
                />
              }
            />
            <Route
              path="campus"
              element={
                <PlaceholderModulePage
                  moduleName="Module 7: Campus (Tin tức, Sự kiện, Việc làm)"
                  moduleOwner="Bảo (Full-stack Module)"
                  description="Xem tin tức nhà trường, sự kiện học thuật, thông tin học bổng và cơ hội thực tập IT."
                />
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
