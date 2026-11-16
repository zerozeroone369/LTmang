import { Building2, GraduationCap, KeyRound, Phone, Save, ShieldCheck, User } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { authApi } from '../api/authApi';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/auth-context';

export function ProfilePage() {
  const { user, refreshProfile } = useAuth();

  // Profile Edit fields
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileSaving, setProfileSaving] = useState(false);

  // Change Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Feedback notifications
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  if (!user) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Vui lòng đăng nhập để xem hồ sơ cá nhân.
      </div>
    );
  }

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setProfileSaving(true);
    try {
      await authApi.updateProfile({
        fullName: fullName.trim(),
        bio: bio.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      await refreshProfile();
      setFeedback({ type: 'success', text: 'Cập nhật hồ sơ cá nhân thành công!' });
    } catch (err) {
      setFeedback({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', text: 'Mật khẩu xác nhận không khớp với mật khẩu mới.' });
      return;
    }

    setPasswordSaving(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setFeedback({ type: 'success', text: 'Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới.' });
    } catch (err) {
      setFeedback({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <div
          className={`flex items-center justify-between rounded-xl border px-4 py-3 text-xs font-semibold ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          <span>{feedback.text}</span>
          <button type="button" onClick={() => setFeedback(null)} className="text-base font-bold">
            &times;
          </button>
        </div>
      )}

      {/* Virtual Student Card */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-200/80 bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-900 p-6 text-white shadow-xl">
        <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl font-extrabold backdrop-blur-md">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{user.fullName}</h1>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-200 backdrop-blur-xs">
                  {user.status === 'ACTIVE' ? 'Đang theo học' : 'Đã khóa'}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-blue-100/80">{user.email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-blue-100">
                <span className="flex items-center gap-1 font-mono font-bold">
                  <GraduationCap className="h-3.5 w-3.5" /> MSSV: {user.studentCode || 'N/A'}
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" /> Lớp: {user.classInfo?.code || 'Chưa gán'}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white/10 p-4 text-xs backdrop-blur-md">
            <p className="text-[11px] text-blue-200">Không gian học tập:</p>
            <p className="mt-1 font-semibold">{user.school?.name || 'Trường chưa cập nhật'}</p>
            <p className="text-blue-100">
              {user.faculty?.name} &bull; {user.major?.name} ({user.course?.code})
            </p>
          </div>
        </div>
      </div>

      {/* 2-Column Panels */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Profile Edit Form */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <User className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Thông tin cá nhân</h2>
              <p className="text-xs text-slate-500">Cập nhật họ tên, mô tả và liên hệ</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-3.5">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Họ và tên</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Mô tả bản thân (Bio)
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Sở thích học tập, định hướng nghề nghiệp..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Số điện thoại
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0905123456"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-3 pl-8 text-xs outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Link ảnh đại diện (URL)
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={profileSaving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-blue-700 disabled:opacity-60"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{profileSaving ? 'Đang lưu...' : 'Lưu thông tin'}</span>
            </button>
          </form>
        </section>

        {/* Change Password Form */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Bảo mật & Đổi mật khẩu</h2>
              <p className="text-xs text-slate-500">Mã hóa Bcrypt an toàn, kiểm tra độ mạnh</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-3.5">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Mật khẩu hiện tại
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Mật khẩu mới
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 8 ký tự (hoa, thường, số, ký tự đặc biệt)"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={passwordSaving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-slate-800 disabled:opacity-60"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{passwordSaving ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}</span>
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
