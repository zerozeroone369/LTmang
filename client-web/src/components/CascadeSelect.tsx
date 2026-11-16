import React, { useEffect, useState } from 'react';
import { apiClient, getErrorMessage } from '../api/client';
import { Building2, GraduationCap, BookOpen, Calendar, Users } from 'lucide-react';

interface AcademicItem {
  id: number;
  code: string;
  name: string;
}

interface CascadeSelectProps {
  onClassSelected?: (classId: number, classCode: string) => void;
  initialClassId?: number | null;
}

export const CascadeSelect: React.FC<CascadeSelectProps> = ({ onClassSelected }) => {
  const [schools, setSchools] = useState<AcademicItem[]>([]);
  const [faculties, setFaculties] = useState<AcademicItem[]>([]);
  const [majors, setMajors] = useState<AcademicItem[]>([]);
  const [courses, setCourses] = useState<AcademicItem[]>([]);
  const [classes, setClasses] = useState<AcademicItem[]>([]);

  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('');
  const [selectedMajor, setSelectedMajor] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Tải danh sách Trường
  useEffect(() => {
    async function loadSchools() {
      try {
        setLoading(true);
        const res = await apiClient.get('/academic/schools');
        if (res.data?.success) {
          setSchools(res.data.data);
          // Mặc định chọn trường đầu tiên nếu có
          if (res.data.data.length > 0) {
            setSelectedSchool(String(res.data.data[0].id));
          }
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    loadSchools();
  }, []);

  // 2. Khi chọn Trường -> tải Khoa và Khóa
  useEffect(() => {
    if (!selectedSchool) {
      setFaculties([]);
      setCourses([]);
      return;
    }
    async function loadFacultiesAndCourses() {
      try {
        const [facRes, courseRes] = await Promise.all([
          apiClient.get(`/academic/faculties?schoolId=${selectedSchool}`),
          apiClient.get(`/academic/courses?schoolId=${selectedSchool}`),
        ]);
        if (facRes.data?.success) setFaculties(facRes.data.data);
        if (courseRes.data?.success) setCourses(courseRes.data.data);

        setSelectedFaculty('');
        setSelectedMajor('');
        setSelectedClass('');
      } catch (err) {
        setError(getErrorMessage(err));
      }
    }
    loadFacultiesAndCourses();
  }, [selectedSchool]);

  // 3. Khi chọn Khoa -> tải Ngành
  useEffect(() => {
    if (!selectedFaculty) {
      setMajors([]);
      return;
    }
    async function loadMajors() {
      try {
        const res = await apiClient.get(`/academic/majors?facultyId=${selectedFaculty}`);
        if (res.data?.success) setMajors(res.data.data);
        setSelectedMajor('');
        setSelectedClass('');
      } catch (err) {
        setError(getErrorMessage(err));
      }
    }
    loadMajors();
  }, [selectedFaculty]);

  // 4. Khi chọn Ngành hoặc Khóa -> tải Lớp
  useEffect(() => {
    if (!selectedMajor || !selectedCourse) {
      setClasses([]);
      return;
    }
    async function loadClasses() {
      try {
        const res = await apiClient.get(
          `/academic/classes?majorId=${selectedMajor}&courseId=${selectedCourse}`,
        );
        if (res.data?.success) setClasses(res.data.data);
        setSelectedClass('');
      } catch (err) {
        setError(getErrorMessage(err));
      }
    }
    loadClasses();
  }, [selectedMajor, selectedCourse]);

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    if (onClassSelected && classId) {
      const cls = classes.find((c) => String(c.id) === classId);
      onClassSelected(Number(classId), cls ? cls.name : '');
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="font-semibold text-slate-800 text-base flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-600" />
          Bộ chọn Cấu trúc Đào tạo (Cascade Select)
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Chọn nối tiếp: Trường → Khoa → Ngành & Khóa → Lớp sinh hoạt
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        {/* 1. Trường */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" /> 1. Trường học
          </label>
          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">-- Chọn trường học --</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        {/* 2. Khoa */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-slate-400" /> 2. Khoa trực thuộc
          </label>
          <select
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
            disabled={!selectedSchool || faculties.length === 0}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:bg-slate-100"
          >
            <option value="">
              {!selectedSchool ? 'Vui lòng chọn trường trước' : '-- Chọn khoa --'}
            </option>
            {faculties.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.code})
              </option>
            ))}
          </select>
        </div>

        {/* 3. Ngành */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" /> 3. Ngành đào tạo
          </label>
          <select
            value={selectedMajor}
            onChange={(e) => setSelectedMajor(e.target.value)}
            disabled={!selectedFaculty || majors.length === 0}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:bg-slate-100"
          >
            <option value="">
              {!selectedFaculty ? 'Vui lòng chọn khoa trước' : '-- Chọn ngành --'}
            </option>
            {majors.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.code})
              </option>
            ))}
          </select>
        </div>

        {/* 4. Khóa */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> 4. Khóa sinh viên
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            disabled={!selectedSchool || courses.length === 0}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:bg-slate-100"
          >
            <option value="">
              {!selectedSchool ? 'Vui lòng chọn trường trước' : '-- Chọn khóa học --'}
            </option>
            {courses.map((co) => (
              <option key={co.id} value={co.id}>
                {co.name} ({co.code})
              </option>
            ))}
          </select>
        </div>

        {/* 5. Lớp (Mục tiêu cuối) */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-indigo-700 mb-1 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-600" /> 5. Lớp sinh hoạt (Quyết định phân luồng)
          </label>
          <select
            value={selectedClass}
            onChange={handleClassChange}
            disabled={!selectedMajor || !selectedCourse || classes.length === 0}
            className="w-full px-3 py-2.5 bg-indigo-50/50 border border-indigo-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:bg-slate-100"
          >
            <option value="">
              {!selectedMajor || !selectedCourse
                ? 'Vui lòng chọn đủ Ngành và Khóa để hiện lớp'
                : classes.length === 0
                  ? 'Không tìm thấy lớp phù hợp'
                  : '-- Chọn lớp của bạn --'}
            </option>
            {classes.map((cl) => (
              <option key={cl.id} value={cl.id}>
                {cl.name} ({cl.code})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
