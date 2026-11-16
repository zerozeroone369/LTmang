import {
  Bell,
  BookOpen,
  Calendar,
  GraduationCap,
  HelpCircle,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  User,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';

const CLIENT_NAV_ITEMS = [
  { to: '/', label: 'Bảng tin', icon: Home, moduleOwner: 'Thái (M8)' },
  { to: '/communities', label: 'Cộng đồng', icon: Users, moduleOwner: 'Duy (M2)' },
  { to: '/posts', label: 'Bài viết', icon: MessageSquare, moduleOwner: 'Duy (M3)' },
  { to: '/documents', label: 'Tài liệu', icon: BookOpen, moduleOwner: 'Huy (M4)' },
  { to: '/qa', label: 'Hỏi đáp Q&A', icon: HelpCircle, moduleOwner: 'Huy (M5)' },
  { to: '/study-groups', label: 'Nhóm học', icon: GraduationCap, moduleOwner: 'Bảo (M6)' },
  { to: '/campus', label: 'Campus & Sự kiện', icon: Calendar, moduleOwner: 'Bảo (M7)' },
  { to: '/profile', label: 'Hồ sơ cá nhân', icon: User, moduleOwner: 'Tú Anh (M1)' },
];

export function ClientLayout() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-blue-900">
                UniConnect
              </span>
              <span className="ml-1.5 hidden rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-600 sm:inline-block">
                Sinh viên
              </span>
            </div>
          </Link>
        </div>

        {/* Global Search Bar placeholder */}
        <div className="mx-4 hidden max-w-md flex-1 md:block">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm tài liệu, câu hỏi, nhóm học..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 pr-4 pl-10 text-xs text-slate-800 transition outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* User / Notification */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notification bell placeholder (Thái M9) */}
          <button
            type="button"
            title="Thông báo Realtime (Thái - Module 9)"
            className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
            </span>
          </button>

          {user ? (
            <div className="flex items-center gap-2.5">
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-xl bg-slate-50 p-1.5 pr-3 text-xs font-semibold text-slate-800 transition hover:bg-slate-100"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <span className="hidden truncate sm:inline-block sm:max-w-32">{user.fullName}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                title="Đăng xuất"
                className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Body */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        {/* Desktop Sidebar Navigation */}
        <aside className="sticky top-22 hidden h-[calc(100vh-6.5rem)] w-60 shrink-0 space-y-1 overflow-y-auto pr-4 lg:block">
          {CLIENT_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span>{item.label}</span>
                </div>
                <span className="text-[10px] text-slate-400">{item.moduleOwner.split(' ')[0]}</span>
              </NavLink>
            );
          })}
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white p-5 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <span className="font-bold text-blue-900">UniConnect</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="space-y-1">
                {CLIENT_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium ${
                          isActive
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4.5 w-4.5" />
                        <span>{item.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{item.moduleOwner}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Main Workspace / Router Outlet */}
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
