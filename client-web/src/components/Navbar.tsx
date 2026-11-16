import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, MessageSquare, Users2, Shield } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            U
          </div>
          <div>
            <div className="font-bold text-slate-900 text-lg leading-tight tracking-tight">
              Uni<span className="text-indigo-600">Connect</span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Mạng xã hội sinh viên DAU</div>
          </div>
        </Link>

        {/* Navigation Tabs (Module của Duy) */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/communities"
            className={`px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors ${
              location.pathname === '/communities'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users2 className="w-4 h-4" />
            <span>2. Cộng đồng</span>
          </Link>

          <Link
            to="/posts"
            className={`px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors ${
              location.pathname === '/posts' || location.pathname === '/'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>3. Bài viết</span>
          </Link>
        </nav>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-slate-800 leading-tight">
                  {user.fullName}
                </div>
                <div className="text-[11px] text-slate-500">
                  {user.studentCode || user.role}
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs border border-indigo-200">
                {user.fullName.charAt(0)}
              </div>
              <button
                onClick={logout}
                title="Đăng xuất"
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
