import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Users2, PlusCircle, LogOut, Bell, Wifi, Battery, Signal } from 'lucide-react';

export const MobileLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isAuthPage = location.pathname === '/login';

  if (isAuthPage) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center p-3">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-0 sm:py-6 sm:px-4">
      {/* Khung mô phỏng điện thoại Mobile App */}
      <div className="w-full max-w-[430px] h-full sm:h-[880px] bg-slate-50 flex flex-col shadow-2xl sm:rounded-[44px] overflow-hidden border-0 sm:border-[8px] sm:border-slate-800 relative">
        {/* Tai thỏ / Dynamic Island & Status Bar (Chỉ hiện trên khung giả lập mobile) */}
        <div className="hidden sm:flex items-center justify-between px-7 pt-3 pb-1 bg-white text-slate-800 text-[11px] font-semibold select-none shrink-0 z-40">
          <span>9:41</span>
          <div className="w-24 h-5 bg-slate-900 rounded-full mx-auto" />
          <div className="flex items-center gap-1.5 text-slate-700">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Top App Header */}
        <header className="bg-white/95 backdrop-blur px-4 h-14 border-b border-slate-100 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
              U
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-sm leading-tight">
                Uni<span className="text-indigo-600">Connect</span>
              </div>
              <div className="text-[9px] text-slate-400 font-medium">Student Mobile App</div>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center relative hover:bg-slate-200 transition-colors"
                title="Thông báo"
              >
                <Bell className="w-4 h-4" />
                <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5" />
              </button>

              <button
                type="button"
                onClick={logout}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-colors"
                title="Đăng xuất"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </header>

        {/* Main App Content (Cuộn độc lập như app điện thoại) */}
        <main className="flex-1 overflow-y-auto overscroll-contain pb-20">
          {children}
        </main>

        {/* Bottom Tab Navigation Bar cố định ở đáy (Chuẩn Mobile App) */}
        {user && (
          <nav className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200/80 px-4 py-2 flex items-center justify-around z-30 shadow-lg">
            {/* Tab 1: Bài viết / Bảng tin */}
            <Link
              to="/posts"
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                location.pathname === '/posts' || location.pathname === '/'
                  ? 'text-indigo-600 font-bold'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px]">Bảng tin</span>
            </Link>

            {/* Tab 2: Cộng đồng (Module 2 của Duy) */}
            <Link
              to="/communities"
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                location.pathname === '/communities'
                  ? 'text-indigo-600 font-bold'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <Users2 className="w-5 h-5" />
              <span className="text-[10px]">Cộng đồng</span>
            </Link>

            {/* Tab 3: Thông tin cá nhân */}
            <div className="flex flex-col items-center gap-1 py-1 px-3 text-slate-400 font-medium">
              <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[9px] flex items-center justify-center border border-indigo-200">
                {user.fullName.charAt(0)}
              </div>
              <span className="text-[10px]">{user.studentCode || 'Cá nhân'}</span>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
};
