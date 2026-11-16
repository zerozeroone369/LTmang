import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import {
  MessageSquare,
  Users2,
  BookOpen,
  HelpCircle,
  Users,
  Compass,
  LogOut,
  Radio,
  User,
} from 'lucide-react';

export const DesktopAppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">{children}</div>;
  }

  const navItems = [
    {
      to: '/profile',
      active: location.pathname === '/profile',
      icon: User,
      label: '1. Hồ sơ & Thẻ SV ảo',
      badge: 'Tú Anh',
      badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    },
    {
      to: '/posts',
      active: location.pathname === '/posts' || location.pathname === '/',
      icon: MessageSquare,
      label: '3. Bài viết & Tương tác',
      badge: 'Duy',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      to: '/communities',
      active: location.pathname === '/communities',
      icon: Users2,
      label: '2. Cộng đồng sinh viên',
      badge: 'Duy',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      to: '#',
      disabled: true,
      icon: BookOpen,
      label: '4. Tài liệu học tập',
      badge: 'Huy',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      to: '#',
      disabled: true,
      icon: HelpCircle,
      label: '5. Hỏi đáp Q&A',
      badge: 'Huy',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      to: '#',
      disabled: true,
      icon: Users,
      label: '6. Nhóm học tập',
      badge: 'Bảo',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      to: '#',
      disabled: true,
      icon: Compass,
      label: '7. Campus sự kiện',
      badge: 'Bảo',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
  ];

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex overflow-hidden select-none font-sans">
      {/* 1. Left Sidebar (Cột điều hướng Desktop App) */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Vùng kéo thả cửa sổ macOS / Header App */}
          <div className="pt-9 pb-4 px-5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white font-extrabold text-base shadow-lg shadow-indigo-500/30">
                U
              </div>
              <div>
                <div className="font-extrabold text-slate-100 text-sm tracking-tight flex items-center gap-1.5">
                  UniConnect
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 font-mono border border-indigo-500/30">
                    APP
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium">Windows · macOS Desktop</div>
              </div>
            </div>

            <div className="w-2 h-2 rounded-full bg-emerald-500" title="Connected" />
          </div>

          {/* Menu Modules */}
          <div className="px-3 py-4 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              Modules Phân Công (10 Module)
            </div>

            {navItems.map((item, idx) => {
              if (item.disabled) {
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-500 opacity-60 cursor-not-allowed"
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  </div>
                );
              }

              return (
                <Link
                  key={idx}
                  to={item.to}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    item.active
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* User Profile Card ở chân Sidebar */}
        {user && (
          <div className="p-3 border-t border-slate-800 bg-slate-900/80">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                  {user.fullName.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-100 text-xs truncate">
                    {user.fullName}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    {user.studentCode || user.role}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                title="Đăng xuất ứng dụng"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* 2. Main Work Area (Khu vực làm việc chính của Desktop App) */}
      <div className="flex-1 flex flex-col bg-slate-50 text-slate-900 overflow-hidden">
        {/* Top Window Bar */}
        <header className="h-12 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="font-bold text-slate-900">
              {location.pathname === '/profile'
                ? 'Module 1: Hồ Sơ Cá Nhân & Thẻ Sinh Viên Ảo'
                : location.pathname === '/communities'
                ? 'Module 2: Cấu Trúc Đào Tạo & Không Gian Cộng Đồng'
                : 'Module 3: Bảng Tin Bài Viết & Tương Tác Sinh Viên'}
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
              <Radio className="w-3 h-3 animate-pulse" />
              REST API Server: localhost:4000
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400 font-medium">UniConnect Desktop v1.0.0</span>
          </div>
        </header>

        {/* Scrollable Content View */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
