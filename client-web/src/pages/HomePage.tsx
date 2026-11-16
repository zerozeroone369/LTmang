import {
  BookOpen,
  Calendar,
  CheckCircle2,
  GraduationCap,
  HelpCircle,
  MessageSquare,
  Sparkles,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/auth-context';

export function HomePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 text-white shadow-lg sm:p-8">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>Mạng xã hội phục vụ đời sống Sinh viên</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Xin chào, {user ? user.fullName : 'Sinh viên UniConnect'}!
          </h1>
          <p className="text-xs text-blue-100 sm:text-sm">
            Hệ thống kết nối đời sống đại học: học tập, chia sẻ tài liệu, hỏi đáp môn học, tìm nhóm
            học và cập nhật tin tức Campus theo cấu trúc Trường → Khoa → Ngành → Khóa → Lớp.
          </p>
          {user && (
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-xl bg-white/15 px-3 py-1.5 font-medium">
                Lớp: <strong>{user.classInfo?.code || 'Chưa gán lớp'}</strong>
              </span>
              <span className="rounded-xl bg-white/15 px-3 py-1.5 font-medium">
                Khoa: <strong>{user.faculty?.code || user.school?.code}</strong>
              </span>
              <span className="rounded-xl bg-white/15 px-3 py-1.5 font-medium">
                Trường: <strong>{user.school?.code || user.school?.name}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Module Navigation Grid */}
      <div>
        <h2 className="mb-3 text-sm font-bold text-slate-800">
          Không gian chức năng (10 Module sở hữu trọn gói):
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/profile"
            className="flex items-start gap-3.5 rounded-2xl border border-blue-200/80 bg-blue-50/40 p-4 transition hover:bg-blue-50 hover:shadow-xs"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-700">Module 1 (Đã hoàn thành)</p>
              <h3 className="text-sm font-bold text-slate-900">Tài khoản & Hồ sơ cá nhân</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Đăng ký, đăng nhập, đổi mật khẩu, phân cấp cộng đồng. (Phụ trách: Tú Anh)
              </p>
            </div>
          </Link>

          <Link
            to="/communities"
            className="flex items-start gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 transition hover:bg-slate-50 hover:shadow-xs"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-indigo-600">Module 2 (Duy)</p>
              <h3 className="text-sm font-bold text-slate-900">Không gian Cộng đồng</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Phân luồng Trường → Khoa → Ngành → Khóa → Lớp.
              </p>
            </div>
          </Link>

          <Link
            to="/posts"
            className="flex items-start gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 transition hover:bg-slate-50 hover:shadow-xs"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-sky-600">Module 3 (Duy)</p>
              <h3 className="text-sm font-bold text-slate-900">Bài viết & Tương tác</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Đăng bài theo phạm vi, like, comment, báo cáo vi phạm.
              </p>
            </div>
          </Link>

          <Link
            to="/documents"
            className="flex items-start gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 transition hover:bg-slate-50 hover:shadow-xs"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-teal-600">Module 4 (Huy)</p>
              <h3 className="text-sm font-bold text-slate-900">Tài liệu học tập</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Upload/download file &lt;20MB, đánh giá sao, lọc môn học.
              </p>
            </div>
          </Link>

          <Link
            to="/qa"
            className="flex items-start gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 transition hover:bg-slate-50 hover:shadow-xs"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-amber-600">Module 5 (Huy)</p>
              <h3 className="text-sm font-bold text-slate-900">Hỏi đáp học thuật (Q&A)</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Đặt câu hỏi theo môn, upvote, chốt câu trả lời đúng.
              </p>
            </div>
          </Link>

          <Link
            to="/study-groups"
            className="flex items-start gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 transition hover:bg-slate-50 hover:shadow-xs"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-violet-600">Module 6 (Bảo)</p>
              <h3 className="text-sm font-bold text-slate-900">Nhóm học (Study Groups)</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Tạo nhóm học, tìm bạn cùng mục tiêu, duyệt thành viên.
              </p>
            </div>
          </Link>

          <Link
            to="/campus"
            className="flex items-start gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 transition hover:bg-slate-50 hover:shadow-xs"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-rose-600">Module 7 (Bảo)</p>
              <h3 className="text-sm font-bold text-slate-900">Campus & Việc làm</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Thông báo, lịch thi, học bổng, câu lạc bộ, thực tập.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
