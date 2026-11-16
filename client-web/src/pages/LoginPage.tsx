import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserCheck, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('duy_2351220091@dau.edu.vn');
  const [password, setPassword] = useState('Student@123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.post('/auth/login', {
        identifier,
        password,
      });

      if (res.data?.success) {
        const { accessToken, user } = res.data.data;
        login(accessToken, user);
        navigate('/posts');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const quickSelectUser = (email: string) => {
    setIdentifier(email);
    setPassword('Student@123456');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xl mx-auto shadow-md">
            U
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-2">Đăng Nhập Sinh Viên</h2>
          <p className="text-xs text-slate-500">Mạng xã hội học tập & cộng đồng UniConnect</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email hoặc Mã sinh viên:
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu:</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        {/* Nút đăng nhập nhanh để Demo cho thầy */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
            Tài khoản mẫu để Test & Demo:
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => quickSelectUser('duy_2351220091@dau.edu.vn')}
              className="p-2 bg-indigo-50 text-indigo-700 font-semibold rounded-xl hover:bg-indigo-100 text-left flex items-center gap-1.5 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Duy (23CT1)</span>
            </button>

            <button
              type="button"
              onClick={() => quickSelectUser('anh_2351220089@dau.edu.vn')}
              className="p-2 bg-violet-50 text-violet-700 font-semibold rounded-xl hover:bg-violet-100 text-left flex items-center gap-1.5 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Tú Anh (23CT1)</span>
            </button>

            <button
              type="button"
              onClick={() => quickSelectUser('bao_2351220093@dau.edu.vn')}
              className="p-2 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 text-left flex items-center gap-1.5 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Bảo (23CT2)</span>
            </button>

            <button
              type="button"
              onClick={() => quickSelectUser('admin@uniconnect.edu.vn')}
              className="p-2 bg-rose-50 text-rose-700 font-semibold rounded-xl hover:bg-rose-100 text-left flex items-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin (Quản trị)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
