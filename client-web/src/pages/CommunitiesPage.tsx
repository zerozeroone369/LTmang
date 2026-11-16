import React, { useEffect, useState } from 'react';
import { apiClient, getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { CascadeSelect } from '../components/CascadeSelect';
import {
  Building2,
  GraduationCap,
  BookOpen,
  Calendar,
  Users,
  Search,
  UserCheck,
  Sparkles,
  Layers,
} from 'lucide-react';

interface CommunityMeData {
  user: {
    id: number;
    fullName: string;
    studentCode: string;
    avatarUrl: string | null;
  };
  hierarchy: {
    school: { id: number; code: string; name: string } | null;
    faculty: { id: number; code: string; name: string } | null;
    major: { id: number; code: string; name: string } | null;
    course: { id: number; code: string; name: string } | null;
    class: { id: number; code: string; name: string } | null;
  };
  stats: {
    totalStudentsInClass: number;
    totalStudentsInMajor: number;
    totalStudentsInFaculty: number;
    totalStudentsInSchool: number;
  };
  classmates: Array<{
    id: number;
    studentCode: string;
    fullName: string;
    avatarUrl: string | null;
    bio: string | null;
  }>;
}

export const CommunitiesPage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [data, setData] = useState<CommunityMeData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadCommunityInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get('/communities/me');
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommunityInfo();
  }, []);

  const handleUpdateClass = async (classId: number, className: string) => {
    try {
      setError(null);
      await apiClient.put('/users/profile', { classId });
      setSuccessMsg(`Đã cập nhật sinh hoạt vào: ${className}`);
      await refreshProfile();
      await loadCommunityInfo();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const filteredClassmates = data?.classmates?.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.studentCode?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Banner Giới thiệu Module 2 của Duy */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur">
            <Sparkles className="w-3.5 h-3.5" />
            Module 2: Cộng đồng sinh viên — Phụ trách: Duy
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Cấu Trúc Phân Luồng Sinh Viên
          </h1>
          <p className="text-indigo-100 text-sm leading-relaxed">
            Hệ thống tự động đưa sinh viên vào các cộng đồng theo Lớp sinh hoạt: từ{' '}
            <span className="font-semibold text-white">Lớp → Khóa → Ngành → Khoa → Trường</span>.
            Chỉ cần biết Lớp là suy ra được toàn bộ cấu trúc đào tạo.
          </p>
        </div>
        <div className="absolute -right-10 -bottom-10 opacity-10">
          <Layers className="w-72 h-72 text-white" />
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-sm font-medium flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* 5 Cấp Đào Tạo & Thống Kê Sĩ Số */}
      {data && data.hierarchy && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            Cây Phân Cấp Cộng Đồng Của Bạn
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* 1. Trường */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  1. Trường
                </div>
                <div className="font-bold text-slate-900 text-sm mt-0.5 line-clamp-1">
                  {data.hierarchy.school?.name || 'Chưa cập nhật'}
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  {data.hierarchy.school?.code}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                <span>Toàn trường:</span>
                <span className="font-bold text-slate-800">
                  {data.stats.totalStudentsInSchool} SV
                </span>
              </div>
            </div>

            {/* 2. Khoa */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  2. Khoa
                </div>
                <div className="font-bold text-slate-900 text-sm mt-0.5 line-clamp-1">
                  {data.hierarchy.faculty?.name || 'Chưa cập nhật'}
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  {data.hierarchy.faculty?.code}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                <span>Khoa:</span>
                <span className="font-bold text-slate-800">
                  {data.stats.totalStudentsInFaculty} SV
                </span>
              </div>
            </div>

            {/* 3. Ngành */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  3. Ngành
                </div>
                <div className="font-bold text-slate-900 text-sm mt-0.5 line-clamp-1">
                  {data.hierarchy.major?.name || 'Chưa cập nhật'}
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  {data.hierarchy.major?.code}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                <span>Ngành:</span>
                <span className="font-bold text-slate-800">
                  {data.stats.totalStudentsInMajor} SV
                </span>
              </div>
            </div>

            {/* 4. Khóa */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  4. Khóa
                </div>
                <div className="font-bold text-slate-900 text-sm mt-0.5 line-clamp-1">
                  {data.hierarchy.course?.name || 'Chưa cập nhật'}
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  {data.hierarchy.course?.code}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                <span>Khóa:</span>
                <span className="font-bold text-slate-800">K23</span>
              </div>
            </div>

            {/* 5. Lớp */}
            <div className="bg-gradient-to-br from-indigo-50 to-white p-4 rounded-2xl border-2 border-indigo-400 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-2 shadow-sm">
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider">
                  5. Lớp của bạn
                </div>
                <div className="font-bold text-indigo-950 text-base mt-0.5 line-clamp-1">
                  {data.hierarchy.class?.name || 'Chưa xếp lớp'}
                </div>
                <div className="text-xs text-indigo-600 font-mono font-bold">
                  {data.hierarchy.class?.code}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-indigo-200 text-xs text-indigo-900 flex items-center justify-between font-medium">
                <span>Sĩ số lớp:</span>
                <span className="font-bold text-indigo-700 text-sm">
                  {data.stats.totalStudentsInClass} SV
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Danh sách bạn cùng lớp */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Bạn Cùng Lớp ({data?.classmates?.length || 0})
              </h2>
              <p className="text-xs text-slate-500">
                Những sinh viên cùng sinh hoạt trong lớp{' '}
                <span className="font-semibold text-slate-700">
                  {data?.hierarchy?.class?.name}
                </span>
              </p>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm bạn cùng lớp..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-56"
              />
            </div>
          </div>

          {loading ? (
            <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 text-slate-400 text-sm">
              Đang tải danh sách thành viên...
            </div>
          ) : filteredClassmates && filteredClassmates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredClassmates.map((mate) => (
                <div
                  key={mate.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3.5 hover:border-indigo-200 transition-colors"
                >
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    {mate.fullName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 text-sm truncate">
                      {mate.fullName}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      MSSV: {mate.studentCode || 'N/A'}
                    </div>
                    {mate.bio && (
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {mate.bio}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 text-slate-500 text-sm">
              Chưa có bạn cùng lớp nào khác hoặc không tìm thấy kết quả.
            </div>
          )}
        </div>

        {/* Cột Phải: Bộ chọn Cascade Select để Demo chức năng */}
        <div className="space-y-4">
          <CascadeSelect onClassSelected={handleUpdateClass} />
        </div>
      </div>
    </div>
  );
};
