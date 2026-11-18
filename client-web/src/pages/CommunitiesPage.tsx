import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { apiClient, getErrorMessage } from '../api/client';
import { useAuth } from '../context/auth-context';
import { CascadeSelect } from '../components/CascadeSelect';
import { EmptyState } from '../components/EmptyState';
import {
  Building2,
  GraduationCap,
  BookOpen,
  Calendar,
  Users,
  Search,
  Sparkles,
  Layers,
  Inbox,
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
  const { refreshProfile } = useAuth();
  const [data, setData] = useState<CommunityMeData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  const loadCommunityInfo = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/communities/me');
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommunityInfo();
  }, []);

  const handleUpdateClass = async (classId: number, className: string) => {
    try {
      await apiClient.put('/users/profile', { classId });
      toast.success('Cập nhật cộng đồng thành công!', {
        description: `Bạn đã chuyển sang sinh hoạt tại: ${className}`,
      });
      await refreshProfile();
      await loadCommunityInfo();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const filteredClassmates = data?.classmates?.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.studentCode?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Banner Giới thiệu Cộng đồng */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur">
            <Sparkles className="w-3.5 h-3.5" />
            Cộng đồng sinh viên
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
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

      {/* 5 Cấp Đào Tạo & Thống Kê Sĩ Số */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs h-32 animate-pulse space-y-2"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-100" />
              <div className="w-16 h-3 bg-slate-100 rounded" />
              <div className="w-24 h-4 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      ) : (
        data &&
        data.hierarchy && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Cây Phân Cấp Cộng Đồng Của Bạn
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* 1. Trường */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition-colors">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5">
                    <Building2 className="w-4.5 h-4.5" />
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    1. Trường
                  </div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5 line-clamp-1">
                    {data.hierarchy.school?.name || 'Chưa cập nhật'}
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
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
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition-colors">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2.5">
                    <GraduationCap className="w-4.5 h-4.5" />
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    2. Khoa
                  </div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5 line-clamp-1">
                    {data.hierarchy.faculty?.name || 'Chưa cập nhật'}
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    {data.hierarchy.faculty?.code}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                  <span>Sĩ số khoa:</span>
                  <span className="font-bold text-slate-800">
                    {data.stats.totalStudentsInFaculty} SV
                  </span>
                </div>
              </div>

              {/* 3. Ngành */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition-colors">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2.5">
                    <BookOpen className="w-4.5 h-4.5" />
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    3. Ngành
                  </div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5 line-clamp-1">
                    {data.hierarchy.major?.name || 'Chưa cập nhật'}
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    {data.hierarchy.major?.code}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                  <span>Sĩ số ngành:</span>
                  <span className="font-bold text-slate-800">
                    {data.stats.totalStudentsInMajor} SV
                  </span>
                </div>
              </div>

              {/* 4. Khóa */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition-colors">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5">
                    <Calendar className="w-4.5 h-4.5" />
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    4. Khóa
                  </div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5 line-clamp-1">
                    {data.hierarchy.course?.name || 'Chưa cập nhật'}
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    {data.hierarchy.course?.code}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                  <span>Niên khóa:</span>
                  <span className="font-bold text-slate-800">2023 - 2027</span>
                </div>
              </div>

              {/* 5. Lớp */}
              <div className="bg-gradient-to-br from-indigo-50/80 to-white p-4 rounded-2xl border-2 border-indigo-500 shadow-md shadow-indigo-100 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-2.5 shadow-sm">
                    <Users className="w-4.5 h-4.5" />
                  </div>
                  <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                    5. Lớp của bạn
                  </div>
                  <div className="font-extrabold text-indigo-950 text-base mt-0.5 line-clamp-1">
                    {data.hierarchy.class?.name || 'Chưa xếp lớp'}
                  </div>
                  <div className="text-xs text-indigo-600 font-mono font-bold mt-0.5">
                    {data.hierarchy.class?.code}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-indigo-200 text-xs text-indigo-900 flex items-center justify-between font-medium">
                  <span>Sĩ số lớp:</span>
                  <span className="font-extrabold text-indigo-700 text-sm">
                    {data.stats.totalStudentsInClass} SV
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* Danh sách bạn cùng lớp & Cột Cascade Select */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Bạn Cùng Lớp ({data?.classmates?.length || 0})
              </h2>
              <p className="text-xs text-slate-500">
                Các bạn sinh viên cùng sinh hoạt trong{' '}
                <span className="font-semibold text-slate-700">{data?.hierarchy?.class?.name}</span>
              </p>
            </div>

            {/* Ô tìm kiếm */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm bạn cùng lớp..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-56 shadow-2xs"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs h-20 animate-pulse flex items-center gap-3"
                >
                  <div className="w-11 h-11 rounded-full bg-slate-100 shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="w-24 h-3.5 bg-slate-200 rounded" />
                    <div className="w-16 h-2.5 bg-slate-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredClassmates && filteredClassmates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredClassmates.map((mate) => (
                <div
                  key={mate.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3.5 hover:border-indigo-300 hover:shadow-md transition-all group"
                >
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                    {mate.fullName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 text-sm truncate group-hover:text-indigo-600 transition-colors">
                      {mate.fullName}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      MSSV: {mate.studentCode || 'N/A'}
                    </div>
                    {mate.bio && (
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">{mate.bio}</div>
                    )}
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Online" />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Inbox}
              title="Không tìm thấy bạn học"
              description="Chưa có bạn cùng lớp nào khác hoặc từ khóa tìm kiếm không khớp."
            />
          )}
        </div>

        {/* Cột Phải: Bộ chọn Cascade Select */}
        <div className="space-y-4">
          <CascadeSelect onClassSelected={handleUpdateClass} />
        </div>
      </div>
    </div>
  );
};
